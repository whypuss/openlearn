"""
Deck CRUD endpoints
"""
from fastapi import APIRouter, HTTPException
from ..schemas import DeckCreate, DeckUpdate, DeckResponse
from ..auth import get_current_user
from ..db import get_supabase

router = APIRouter(prefix="/decks", tags=["decks"])

@router.get("", response_model=list[DeckResponse])
async def list_decks(user_id: str = get_current_user):
    """List all decks for the current user."""
    db = get_supabase()
    result = db.table("decks").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return result.data

@router.post("", response_model=DeckResponse)
async def create_deck(deck: DeckCreate, user_id: str = get_current_user):
    db = get_supabase()
    data = {**deck.model_dump(), "user_id": user_id}
    result = db.table("decks").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create deck")
    return result.data[0]

@router.get("/{deck_id}", response_model=DeckResponse)
async def get_deck(deck_id: int, user_id: str = get_current_user):
    db = get_supabase()
    result = db.table("decks").select("*").eq("id", deck_id).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Deck not found")
    return result.data[0]

@router.patch("/{deck_id}", response_model=DeckResponse)
async def update_deck(deck_id: int, deck: DeckUpdate, user_id: str = get_current_user):
    db = get_supabase()
    data = {k: v for k, v in deck.model_dump().items() if v is not None}
    result = db.table("decks").update(data).eq("id", deck_id).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Deck not found")
    return result.data[0]

@router.delete("/{deck_id}")
async def delete_deck(deck_id: int, user_id: str = get_current_user):
    db = get_supabase()
    result = db.table("decks").delete().eq("id", deck_id).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Deck not found")
    return {"ok": True}
