"""
AI generation endpoints using OpenRouter API
"""
import os
import re
import json
import httpx
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from ..schemas import GenerateRequest, GenerateResponse, CardResponse
from ..auth import get_current_user
from ..db import get_supabase

router = APIRouter(prefix="/ai", tags=["ai"])

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
DEFAULT_MODEL = "anthropic/claude-3-haiku"  # fast + cheap

def openrouter_generate(prompt: str, max_tokens: int = 1024) -> str:
    """Call OpenRouter API."""
    response = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": DEFAULT_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": 0.7,
        },
        timeout=120.0,
    )
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"OpenRouter error: {response.status_code} {response.text}")
    data = response.json()
    return data["choices"][0]["message"]["content"]

def extract_json(text: str) -> dict | None:
    match = re.search(r'\{[\s\S]*"cards"[\s\S]*\}|\{[\s\S]*"questions"[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None

def flashcard_prompt(text: str, num: int) -> str:
    return f"""You are an expert flashcard creator. Given the input text, generate exactly {num} flashcards that test knowledge of the key concepts.
Each card should have:
- front: a clear question or term (in the same language as the content)
- back: a concise answer or definition
- hint: an optional brief hint (can be null)
- tags: array of relevant topic tags

Output ONLY valid JSON:
{{"cards": [{{"front": "...", "back": "...", "hint": "...", "tags": ["tag1"]}}]}}

Input:
{text}"""

def practice_prompt(text: str, num: int) -> str:
    return f"""You are an expert Japanese language teacher. Based on the input text, generate exactly {num} multiple choice practice questions for JLPT N5-N4 level.
Each question must have:
- question: the question text in Japanese
- options: exactly 4 choices A through D (correct answer mixed in position)
- correctIndex: index 0-3 of the correct answer
- explanation: brief explanation why the answer is correct

Output ONLY valid JSON:
{{"questions": [{{"question": "...", "options": ["A: ...", "B: ...", "C: ...", "D: ..."], "correctIndex": 0, "explanation": "..."}}]}}

Input:
{text}"""

@router.post("/generate")
async def generate(req: GenerateRequest, user_id: str = get_current_user):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    db = get_supabase()

    deck = db.table("decks").select("id").eq("id", req.deck_id).eq("user_id", user_id).execute()
    if not deck.data:
        raise HTTPException(status_code=404, detail="Deck not found")

    try:
        now = datetime.now(timezone.utc).isoformat()

        if req.mode == "flashcards":
            raw = openrouter_generate(flashcard_prompt(req.text, req.num_cards), max_tokens=1024)
            data = extract_json(raw)
            raw_cards = data.get("cards", []) if data else []
            if not raw_cards:
                raise HTTPException(status_code=422, detail="Failed to parse flashcards")

            rows = [
                {
                    "deck_id": req.deck_id, "user_id": user_id,
                    "front": c.get("front", ""), "back": c.get("back", ""),
                    "hint": c.get("hint") or "", "tags": c.get("tags") or [],
                    "fsrs_state": json.dumps({}), "interval_secs": 0,
                    "ease_factor": 2.5, "due_date": now, "created_at": now, "updated_at": now,
                }
                for c in raw_cards
            ]
            result = db.table("cards").insert(rows).execute()
            cards_response = result.data
        else:
            raw = openrouter_generate(practice_prompt(req.text, req.num_cards), max_tokens=2048)
            data = extract_json(raw)
            raw_qs = data.get("questions", []) if data else []
            if not raw_qs:
                raise HTTPException(status_code=422, detail="Failed to parse questions")

            rows = []
            for q in raw_qs:
                opts = q.get("options", [])
                correct = q.get("correctIndex", 0)
                rows.append({
                    "deck_id": req.deck_id, "user_id": user_id,
                    "front": f"【Practice Q】{q.get('question', '')}",
                    "back": f"答案: {opts[correct] if correct < len(opts) else 'N/A'}\n\n💡 {q.get('explanation', '')}",
                    "hint": " | ".join(opts),
                    "tags": ["practice"],
                    "fsrs_state": json.dumps({"correctIndex": correct, "options": opts}),
                    "interval_secs": 0, "ease_factor": 2.5,
                    "due_date": now, "created_at": now, "updated_at": now,
                })
            result = db.table("cards").insert(rows).execute()
            cards_response = result.data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    return GenerateResponse(
        cards=[CardResponse(**c) for c in cards_response],
        questions=[],
        model_used="anthropic/claude-3-haiku",
    )
