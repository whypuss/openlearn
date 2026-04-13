"""
OpenLearn — AI Service (FastAPI)
Multi-user, deployed on Render
Connects to Supabase DB + Hugging Face Inference API
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routers import decks, cards, reviews, ai

app = FastAPI(
    title="OpenLearn API",
    version="1.0.0",
    description="AI flashcard service with spaced repetition",
)

# ─── CORS ──────────────────────────────────────────────────────
frontend_url = os.getenv("FRONTEND_URL", "https://openlearn.pages.dev")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        frontend_url,
        "https://*.hf.space",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

# ─── Health ────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "openlearn-api",
        "supabase_configured": bool(os.getenv("SUPABASE_URL")),
        "hf_model": "Qwen/Qwen2.5-7B-Instruct",
    }

# ─── Routes ────────────────────────────────────────────────────
app.include_router(decks.router)
app.include_router(cards.router)
app.include_router(reviews.router)
app.include_router(ai.router)

# ─── Global error handler ──────────────────────────────────────
@app.exception_handler(Exception)
async def global_error(request, exc):
    return JSONResponse(status_code=500, content={"detail": str(exc)})
