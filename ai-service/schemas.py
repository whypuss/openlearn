"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ─── Decks ────────────────────────────────────────────────────

class DeckCreate(BaseModel):
    name: str
    description: str = ""

class DeckUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class DeckResponse(BaseModel):
    id: int
    user_id: str
    name: str
    description: str
    created_at: str
    updated_at: str

# ─── Cards ────────────────────────────────────────────────────

class CardCreate(BaseModel):
    deck_id: int
    front: str
    back: str
    hint: str = ""
    tags: list[str] = []

class CardUpdate(BaseModel):
    front: Optional[str] = None
    back: Optional[str] = None
    hint: Optional[str] = None
    tags: Optional[list[str]] = None

class CardResponse(BaseModel):
    id: int
    deck_id: int
    user_id: str
    front: str
    back: str
    hint: str
    tags: list[str]
    fsrs_state: dict
    due_date: Optional[str]
    interval_secs: int
    ease_factor: float
    created_at: str
    updated_at: str

# ─── Reviews ─────────────────────────────────────────────────

class ReviewSubmit(BaseModel):
    card_id: int
    rating: int  # 1-4 (Again, Hard, Good, Easy)

class ReviewResponse(BaseModel):
    card_id: int
    new_interval_secs: int
    new_ease_factor: float
    next_due: str

# ─── AI Generation ────────────────────────────────────────────

class GenerateRequest(BaseModel):
    text: str
    num_cards: int = 10
    deck_id: int
    mode: str = "flashcards"  # "flashcards" or "practice"

class GenerateResponse(BaseModel):
    cards: list[CardResponse]
    questions: list[dict]
    model_used: str
