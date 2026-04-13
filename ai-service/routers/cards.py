"""
Card CRUD endpoints
"""
import json
from fastapi import APIRouter, HTTPException
from ..schemas import CardCreate, CardUpdate, CardResponse
from ..auth import get_current_user
from ..db import get_supabase

router = APIRouter(prefix="/cards", tags=["cards"])

def _card_to_response(card: dict) -> dict:
    """Convert DB card to response, parsing fsrs_state JSON if needed."""
    card = dict(card)
    fsrs = card.get("fsrs_state")
    if isinstance(fsrs, str):
        try:
            card["fsrs_state"] = json.loads(fsrs)
        except Exception:
            card["fsrs_state"] = {}
    return card

@router.get("/deck/{deck_id}", response_model=list[CardResponse])
async def list_cards(deck_id: int, user_id: str = get_current_user):
    db = get_supabase()
    result = db.table("cards").select("*").eq("deck_id", deck_id).eq("user_id", user_id).execute()
    return [_card_to_response(c) for c in result.data]

@router.get("/due", response_model=list[CardResponse])
async def list_due_cards(user_id: str = get_current_user):
    db = get_supabase()
    result = db.table("cards").select("*").eq("user_id", user_id).lte("due_date", "now()").execute()
    return [_card_to_response(c) for c in result.data]

@router.post("", response_model=CardResponse)
async def create_card(card: CardCreate, user_id: str = get_current_user):
    db = get_supabase()
    # Verify deck belongs to user
    deck = db.table("decks").select("id").eq("id", card.deck_id).eq("user_id", user_id).execute()
    if not deck.data:
        raise HTTPException(status_code=404, detail="Deck not found")

    data = {
        **card.model_dump(),
        "user_id": user_id,
        "fsrs_state": json.dumps(card.model_dump().get("fsrs_state", {})),
        "interval_secs": 0,
        "ease_factor": 2.5,
    }
    result = db.table("cards").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create card")
    return _card_to_response(result.data[0])

@router.patch("/{card_id}", response_model=CardResponse)
async def update_card(card_id: int, card: CardUpdate, user_id: str = get_current_user):
    db = get_supabase()
    data = {k: v for k, v in card.model_dump().items() if v is not None}
    result = db.table("cards").update(data).eq("id", card_id).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Card not found")
    return _card_to_response(result.data[0])

@router.delete("/{card_id}")
async def delete_card(card_id: int, user_id: str = get_current_user):
    db = get_supabase()
    result = db.table("cards").delete().eq("id", card_id).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Card not found")
    return {"ok": True}

