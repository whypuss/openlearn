//! OpenLearn — Rust Backend
//! SQLite + SM-2 spaced repetition scheduler

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use chrono::{DateTime, Duration, Utc};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use thiserror::Error;
use uuid::Uuid;

// ─── Error Types ─────────────────────────────────────────────────────────────

#[derive(Error, Debug)]
pub enum AppError {
    #[error("database error: {0}")]
    Db(#[from] rusqlite::Error),
    #[error("not found: {0}")]
    NotFound(String),
    #[error("bad request: {0}")]
    BadRequest(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, msg) = match &self {
            AppError::Db(_) => (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),
            AppError::NotFound(_) => (StatusCode::NOT_FOUND, self.to_string()),
            AppError::BadRequest(_) => (StatusCode::BAD_REQUEST, self.to_string()),
        };
        (status, Json(json!({ "error": msg }))).into_response()
    }
}

// ─── SM-2 Scheduler (pure Rust, no fsrs crate needed) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SM2State {
    pub interval_days: i64,    // previous interval
    pub reps: i64,            // repetition count
    pub ease_factor: f64,     // ease factor (min 1.3)
    pub due_date: String,     // ISO date string
}

impl Default for SM2State {
    fn default() -> Self {
        Self {
            interval_days: 0,
            reps: 0,
            ease_factor: 2.5,
            due_date: Utc::now().to_rfc3339(),
        }
    }
}

/// Map rating (1-4) to SM-2 quality (0-5)
fn rating_to_quality(rating: i32) -> i32 {
    match rating {
        1 => 0,  // Again
        2 => 2,  // Hard
        3 => 4,  // Good
        4 => 5,  // Easy
        _ => 4,
    }
}

/// Apply SM-2 scheduling and return new state + due date
fn sm2_schedule(state: &SM2State, rating: i32) -> (SM2State, DateTime<Utc>) {
    let quality = rating_to_quality(rating);
    let ef = state.ease_factor;
    let interval = state.interval_days;
    let reps = state.reps;

    let (new_interval, new_reps, new_ef) = if quality < 3 {
        // Failed — reset
        (1, 0, ef)
    } else {
        // Passed
        let new_i = if reps == 0 {
            1
        } else if reps == 1 {
            6
        } else {
            (interval as f64 * ef).round() as i64
        };
        let new_r = reps + 1;
        let mut new_e = ef + (0.1 - (5.0 - quality as f64) * (0.08 + (5.0 - quality as f64) * 0.02));
        if new_e < 1.3 {
            new_e = 1.3;
        }
        (new_i, new_r, (new_e * 100.0).round() / 100.0)
    };

    let now = Utc::now();
    let due_date = now + Duration::days(new_interval);

    let new_state = SM2State {
        interval_days: new_interval,
        reps: new_reps,
        ease_factor: new_ef,
        due_date: due_date.to_rfc3339(),
    };

    (new_state, due_date)
}

// ─── Data Models ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Deck {
    pub id: String,
    pub name: String,
    pub description: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Card {
    pub id: String,
    pub deck_id: String,
    pub front: String,
    pub back: String,
    pub hint: Option<String>,
    pub tags: Vec<String>,
    pub source_id: String,
    pub created_at: String,
    pub sm2_state: SM2State,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewLog {
    pub id: String,
    pub card_id: String,
    pub rating: i32,
    pub reviewed_at: String,
    pub interval_secs: i64,
    pub ease_factor: f64,
}

// ─── Database ─────────────────────────────────────────────────────────────────

#[derive(Clone)]
pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn new(path: &str) -> Result<Self, AppError> {
        let conn = Connection::open(path)?;
        let db = Self { conn: Arc::new(Mutex::new(conn)) };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> Result<(), AppError> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS decks (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS cards (
                id TEXT PRIMARY KEY,
                deck_id TEXT NOT NULL,
                front TEXT NOT NULL,
                back TEXT NOT NULL,
                hint TEXT,
                tags TEXT NOT NULL DEFAULT '[]',
                source_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                sm2_state TEXT NOT NULL DEFAULT '{}',
                interval_days INTEGER NOT NULL DEFAULT 0,
                ease_factor REAL NOT NULL DEFAULT 2.5,
                due_date TEXT,
                FOREIGN KEY (deck_id) REFERENCES decks(id)
            );
            CREATE TABLE IF NOT EXISTS review_logs (
                id TEXT PRIMARY KEY,
                card_id TEXT NOT NULL,
                rating INTEGER NOT NULL,
                reviewed_at TEXT NOT NULL,
                interval_secs INTEGER NOT NULL,
                ease_factor REAL NOT NULL,
                FOREIGN KEY (card_id) REFERENCES cards(id)
            );
            CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
            CREATE INDEX IF NOT EXISTS idx_cards_due_date ON cards(due_date);
            CREATE INDEX IF NOT EXISTS idx_review_logs_card_id ON review_logs(card_id);
            ",
        )?;
        Ok(())
    }

    // ── Deck CRUD ──────────────────────────────────────────────────────────────

    pub fn create_deck(&self, name: &str, description: &str) -> Result<Deck, AppError> {
        let conn = self.conn.lock().unwrap();
        let deck = Deck {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            description: description.to_string(),
            created_at: Utc::now().to_rfc3339(),
        };
        conn.execute(
            "INSERT INTO decks (id, name, description, created_at) VALUES (?1, ?2, ?3, ?4)",
            params![deck.id, deck.name, deck.description, deck.created_at],
        )?;
        Ok(deck)
    }

    pub fn list_decks(&self) -> Result<Vec<Deck>, AppError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, name, description, created_at FROM decks ORDER BY created_at DESC")?;
        let decks = stmt
            .query_map([], |row| {
                Ok(Deck {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    created_at: row.get(3)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(decks)
    }

    pub fn get_deck(&self, id: &str) -> Result<Deck, AppError> {
        let conn = self.conn.lock().unwrap();
        let deck = conn.query_row(
            "SELECT id, name, description, created_at FROM decks WHERE id = ?1",
            params![id],
            |row| {
                Ok(Deck {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    created_at: row.get(3)?,
                })
            },
        )?;
        Ok(deck)
    }

    pub fn delete_deck(&self, id: &str) -> Result<(), AppError> {
        let conn = self.conn.lock().unwrap();
        // Collect card IDs first
        let cards: Vec<String> = {
            let mut stmt = conn.prepare("SELECT id FROM cards WHERE deck_id = ?1")?;
            let rows = stmt.query_map(params![id], |row| row.get::<_, String>(0))?;
            rows.filter_map(|r| r.ok()).collect()
        };
        for card_id in cards {
            conn.execute("DELETE FROM review_logs WHERE card_id = ?1", params![card_id])?;
        }
        conn.execute("DELETE FROM cards WHERE deck_id = ?1", params![id])?;
        conn.execute("DELETE FROM decks WHERE id = ?1", params![id])?;
        Ok(())
    }

    // ── Card CRUD ──────────────────────────────────────────────────────────────

    pub fn create_card(
        &self,
        deck_id: &str,
        front: &str,
        back: &str,
        hint: Option<&str>,
        tags: &[String],
        source_id: &str,
    ) -> Result<Card, AppError> {
        let conn = self.conn.lock().unwrap();
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        let tags_json = serde_json::to_string(tags).unwrap_or_else(|_| "[]".to_string());
        let sm2 = SM2State::default();
        let sm2_json = serde_json::to_string(&sm2).unwrap_or_else(|_| "{}".to_string());

        conn.execute(
            "INSERT INTO cards (id, deck_id, front, back, hint, tags, source_id, created_at, sm2_state, interval_days, ease_factor, due_date)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![id, deck_id, front, back, hint, tags_json, source_id, now, sm2_json, sm2.interval_days, sm2.ease_factor, sm2.due_date],
        )?;

        Ok(Card {
            id,
            deck_id: deck_id.to_string(),
            front: front.to_string(),
            back: back.to_string(),
            hint: hint.map(String::from),
            tags: tags.to_vec(),
            source_id: source_id.to_string(),
            created_at: now,
            sm2_state: sm2,
        })
    }

    pub fn get_card(&self, card_id: &str) -> Result<Card, AppError> {
        let conn = self.conn.lock().unwrap();
        let card = conn.query_row(
            "SELECT id, deck_id, front, back, hint, tags, source_id, created_at, sm2_state, interval_days, ease_factor, due_date
             FROM cards WHERE id = ?1",
            params![card_id],
            Self::map_card,
        )?;
        Ok(card)
    }

    pub fn list_cards(&self, deck_id: &str) -> Result<Vec<Card>, AppError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, deck_id, front, back, hint, tags, source_id, created_at, sm2_state, interval_days, ease_factor, due_date
             FROM cards WHERE deck_id = ?1 ORDER BY created_at DESC",
        )?;
        let cards = stmt
            .query_map(params![deck_id], Self::map_card)?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(cards)
    }

    pub fn get_due_cards(&self, deck_id: Option<&str>, limit: usize) -> Result<Vec<Card>, AppError> {
        let conn = self.conn.lock().unwrap();
        let now = Utc::now().to_rfc3339();

        let sql = match deck_id {
            Some(_) => {
                "SELECT id, deck_id, front, back, hint, tags, source_id, created_at, sm2_state, interval_days, ease_factor, due_date
                 FROM cards
                 WHERE deck_id = ?1 AND (due_date IS NULL OR due_date <= ?2)
                 ORDER BY due_date ASC
                 LIMIT ?3"
            }
            None => {
                "SELECT id, deck_id, front, back, hint, tags, source_id, created_at, sm2_state, interval_days, ease_factor, due_date
                 FROM cards
                 WHERE due_date IS NULL OR due_date <= ?1
                 ORDER BY due_date ASC
                 LIMIT ?2"
            }
        };

        let mut stmt = conn.prepare(sql)?;
        let cards = match deck_id {
            Some(did) => stmt.query_map(params![did, now, limit as i64], Self::map_card)?,
            None => stmt.query_map(params![now, limit as i64], Self::map_card)?,
        }
        .collect::<Result<Vec<_>, _>>()?;
        Ok(cards)
    }

    pub fn delete_card(&self, card_id: &str) -> Result<(), AppError> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM review_logs WHERE card_id = ?1", params![card_id])?;
        conn.execute("DELETE FROM cards WHERE id = ?1", params![card_id])?;
        Ok(())
    }

    pub fn review_card(&self, card_id: &str, rating: i32) -> Result<Card, AppError> {
        // Get current state
        let (sm2_json, _interval_days, _ease_factor): (String, i64, f64) = {
            let conn = self.conn.lock().unwrap();
            conn.query_row(
                "SELECT sm2_state, interval_days, ease_factor FROM cards WHERE id = ?1",
                params![card_id],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .map_err(|_| AppError::NotFound(format!("card {} not found", card_id)))?
        };

        let current_state: SM2State =
            serde_json::from_str(&sm2_json).unwrap_or_else(|_| SM2State::default());

        let (new_state, due_date) = sm2_schedule(&current_state, rating);
        let new_interval_secs = new_state.interval_days * 86400;
        let new_sm2_json = serde_json::to_string(&new_state).unwrap_or_else(|_| "{}".to_string());

        // Update card
        {
            let conn = self.conn.lock().unwrap();
            conn.execute(
                "UPDATE cards SET sm2_state = ?1, interval_days = ?2, ease_factor = ?3, due_date = ?4 WHERE id = ?5",
                params![new_sm2_json, new_state.interval_days, new_state.ease_factor, due_date.to_rfc3339(), card_id],
            )?;

            // Log review
            let log_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO review_logs (id, card_id, rating, reviewed_at, interval_secs, ease_factor) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![log_id, card_id, rating, Utc::now().to_rfc3339(), new_interval_secs, new_state.ease_factor],
            )?;
        }

        // Return updated card
        self.get_card(card_id)
    }

    fn map_card(row: &rusqlite::Row) -> rusqlite::Result<Card> {
        let tags_str: String = row.get(5)?;
        let tags: Vec<String> = serde_json::from_str(&tags_str).unwrap_or_default();
        let sm2_str: String = row.get(8)?;
        let sm2_state: SM2State = serde_json::from_str(&sm2_str).unwrap_or_default();

        Ok(Card {
            id: row.get(0)?,
            deck_id: row.get(1)?,
            front: row.get(2)?,
            back: row.get(3)?,
            hint: row.get(4)?,
            tags,
            source_id: row.get(6)?,
            created_at: row.get(7)?,
            sm2_state,
        })
    }
}

// ─── App State ────────────────────────────────────────────────────────────────

#[derive(Clone)]
struct AppState {
    db: Database,
}

// ─── Routes ──────────────────────────────────────────────────────────────────

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok", "service": "openlearn-backend" }))
}

// Deck routes
async fn list_decks(State(state): State<AppState>) -> Result<Json<Vec<Deck>>, AppError> {
    Ok(Json(state.db.list_decks()?))
}

async fn create_deck(State(state): State<AppState>, Json(payload): Json<Value>) -> Result<Json<Deck>, AppError> {
    let name = payload["name"].as_str().unwrap_or("New Deck");
    let description = payload["description"].as_str().unwrap_or("");
    Ok(Json(state.db.create_deck(name, description)?))
}

async fn get_deck(State(state): State<AppState>, Path(id): Path<String>) -> Result<Json<Deck>, AppError> {
    Ok(Json(state.db.get_deck(&id)?))
}

async fn delete_deck(State(state): State<AppState>, Path(id): Path<String>) -> Result<StatusCode, AppError> {
    state.db.delete_deck(&id)?;
    Ok(StatusCode::NO_CONTENT)
}

// Card routes
async fn list_cards(State(state): State<AppState>, Path(deck_id): Path<String>) -> Result<Json<Vec<Card>>, AppError> {
    Ok(Json(state.db.list_cards(&deck_id)?))
}

async fn create_card(State(state): State<AppState>, Json(payload): Json<Value>) -> Result<Json<Card>, AppError> {
    let deck_id = payload["deck_id"]
        .as_str()
        .ok_or_else(|| AppError::BadRequest("deck_id required".to_string()))?;
    let front = payload["front"].as_str().unwrap_or("");
    let back = payload["back"].as_str().unwrap_or("");
    let hint = payload["hint"].as_str();
    let tags: Vec<String> = payload["tags"]
        .as_array()
        .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
        .unwrap_or_default();
    let source_id = payload["source_id"].as_str().unwrap_or("manual");
    Ok(Json(state.db.create_card(deck_id, front, back, hint, &tags, source_id)?))
}

async fn get_due_cards(
    State(state): State<AppState>,
    Query(params): Query<HashMap<String, String>>,
) -> Result<Json<Vec<Card>>, AppError> {
    let deck_id = params.get("deck_id").map(|s| s.as_str());
    let limit = params.get("limit").and_then(|s| s.parse().ok()).unwrap_or(20);
    Ok(Json(state.db.get_due_cards(deck_id, limit)?))
}

async fn get_card(State(state): State<AppState>, Path(card_id): Path<String>) -> Result<Json<Card>, AppError> {
    Ok(Json(state.db.get_card(&card_id)?))
}

async fn delete_card(State(state): State<AppState>, Path(card_id): Path<String>) -> Result<StatusCode, AppError> {
    state.db.delete_card(&card_id)?;
    Ok(StatusCode::NO_CONTENT)
}

// Review route
async fn review_card(State(state): State<AppState>, Json(payload): Json<Value>) -> Result<Json<Card>, AppError> {
    let card_id = payload["card_id"]
        .as_str()
        .ok_or_else(|| AppError::BadRequest("card_id required".to_string()))?;
    let rating = payload["rating"].as_i64().unwrap_or(3) as i32;
    Ok(Json(state.db.review_card(card_id, rating)?))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let db = Database::new("openlearn.db")?;

    let app = Router::new()
        .route("/health", get(health))
        // Decks
        .route("/api/decks", get(list_decks))
        .route("/api/decks", post(create_deck))
        .route("/api/decks/{id}", get(get_deck))
        .route("/api/decks/{id}", axum::routing::delete(delete_deck))
        // Cards
        .route("/api/decks/{deck_id}/cards", get(list_cards))
        .route("/api/decks/{deck_id}/cards", post(create_card))
        .route("/api/cards/due", get(get_due_cards))
        .route("/api/cards/{card_id}", get(get_card))
        .route("/api/cards/{card_id}", axum::routing::delete(delete_card))
        // Review
        .route("/api/review", post(review_card))
        .with_state(AppState { db });

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    println!("OpenLearn Backend running on http://localhost:8080");
    axum::serve(listener, app).await?;
    Ok(())
}
