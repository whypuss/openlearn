"""
Review scheduling endpoints (SM-2 algorithm)
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta, timezone
from ..schemas import ReviewSubmit, ReviewResponse
from ..auth import get_current_user
from ..db import get_supabase

router = APIRouter(prefix="/reviews", tags=["reviews"])

def sm2_schedule(interval_secs: int, ease_factor: float, rating: int):
    """SM-2 spaced repetition: rating 1-4 (Again/Hard/Good/Easy)."""
    if rating == 1:  # Again
        new_interval = 0
        new_ease = max(1.3, ease_factor - 0.2)
    elif rating == 2:  # Hard
        new_interval = max(1, int(interval_secs * 1.2))
        new_ease = max(1.3, ease_factor - 0.15)
    elif rating == 4:  # Easy
        new_interval = int(interval_secs * ease_factor * 1.3) if interval_secs > 0 else 86400 * 4
        new_ease = ease_factor + 0.15
    else:  # Good
        new_interval = 86400 if interval_secs == 0 else int(interval_secs * ease_factor)
        new_ease = ease_factor
    return min(new_interval, 86400 * 365), min(2.5, max(1.3, new_ease))

@router.post("", response_model=ReviewResponse)
async def submit_review(review: ReviewSubmit, user_id: str = get_current_user):
    if review.rating not in (1, 2, 3, 4):
        raise HTTPException(status_code=400, detail="Rating must be 1-4")

    db = get_supabase()

    card = db.table("cards").select("*").eq("id", review.card_id).eq("user_id", user_id).execute()
    if not card.data:
        raise HTTPException(status_code=404, detail="Card not found")

    new_interval, new_ease = sm2_schedule(
        card.data[0].get("interval_secs", 0),
        float(card.data[0].get("ease_factor", 2.5)),
        review.rating,
    )

    next_due = datetime.now(timezone.utc) + timedelta(seconds=new_interval)

    db.table("cards").update({
        "interval_secs": new_interval,
        "ease_factor": new_ease,
        "due_date": next_due.isoformat(),
    }).eq("id", review.card_id).eq("user_id", user_id).execute()

    db.table("review_logs").insert({
        "card_id": review.card_id,
        "user_id": user_id,
        "rating": review.rating,
        "interval_secs": new_interval,
        "ease_factor": new_ease,
    }).execute()

    return ReviewResponse(
        card_id=review.card_id,
        new_interval_secs=new_interval,
        new_ease_factor=new_ease,
        next_due=next_due.isoformat(),
    )

