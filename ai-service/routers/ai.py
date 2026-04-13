"""
AI generation endpoints using Hugging Face Inference API
Free tier — no API key required
"""
import re
import json
import httpx
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from ..schemas import GenerateRequest, GenerateResponse, CardResponse
from ..auth import get_current_user
from ..db import get_supabase

router = APIRouter(prefix="/ai", tags=["ai"])

HF_API_BASE = "https://api-inference.huggingface.co/models"
DEFAULT_MODEL = "Qwen/Qwen2.5-7B-Instruct"

def hf_generate(prompt: str, max_tokens: int = 1024) -> str:
    """Call Hugging Face Inference API (sync httpx)."""
    url = f"{HF_API_BASE}/{DEFAULT_MODEL}"
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": max_tokens,
            "temperature": 0.7,
            "return_full_text": False,
        },
        "options": {"use_cache": True, "wait_for_model": True},
    }
    with httpx.Client(timeout=120.0) as client:
        response = client.post(url, json=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"HF API error: {response.status_code} {response.text}")
    result = response.json()
    if isinstance(result, list):
        return result[0].get("generated_text", "")
    if isinstance(result, dict):
        return result.get("generated_text", result.get("content", str(result)))
    return str(result)

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
            raw = hf_generate(flashcard_prompt(req.text, req.num_cards), max_tokens=1024)
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
            raw = hf_generate(practice_prompt(req.text, req.num_cards), max_tokens=2048)
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
        model_used=DEFAULT_MODEL,
    )
