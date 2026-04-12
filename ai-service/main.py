"""
OpenLearn — AI Service
FastAPI + instructor for structured flashcard generation
Supports BYOK (Bring Your Own Key) and official subscription modes
Also supports Hugging Face Inference API (free tier)
"""
import time
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, Optional
import os

import instructor
from openai import OpenAI

from hf_inference import HFFlashcardClient

app = FastAPI(title="OpenLearn AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://whypuss-openlearn.hf.space",
        "https://huggingface.co",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schemas ───────────────────────────────────────────────

class Flashcard(BaseModel):
    front: str
    back: str
    hint: Optional[str] = None
    tags: list[str] = []


class CardBatch(BaseModel):
    cards: list[Flashcard]
    source_id: str
    source_type: Literal["pdf", "youtube", "web", "text"]


class GenerateRequest(BaseModel):
    text: str
    num_cards: int = 10
    source_id: str = "local"
    source_type: Literal["pdf", "youtube", "web", "text"] = "text"


class GenerateResponse(BaseModel):
    cards: list[Flashcard]
    source_id: str
    source_type: str
    model_used: str
    latency_ms: int


class ChatRequest(BaseModel):
    question: str
    context: str  # pre-extracted text from document


class ChatResponse(BaseModel):
    answer: str
    citations: list[dict]
    model_used: str


# ─── AI Provider Routing ────────────────────────────────────

def get_ai_client(api_key: str, base_url: str | None = None):
    """
    Returns an instructor-enabled OpenAI client.
    For BYOK: uses the user's provided key.
    For official subscription: uses the official API key (server-side).
    For Ollama: uses local base_url.
    """
    client = OpenAI(api_key=api_key, base_url=base_url)
    return instructor.from_openai(client)


# ─── Routes ───────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "openlearn-ai"}


@app.post("/generate", response_model=GenerateResponse)
async def generate_cards(
    req: GenerateRequest,
    authorization: Optional[str] = Header(None),
    x_subscription_key: Optional[str] = Header(None),
):
    """
    Generate flashcards from raw text using instructor + AI.
    
    Auth modes (pick one via header):
    - BYOK: Authorization: Bearer ***
    - Official: X-Subscription-Key: <subscription_key>
    - None: offline mode returns empty cards
    """
    # Resolve API key and base URL from environment or headers
    api_key = os.getenv("OPENAI_API_KEY", "")
    base_url = os.getenv("OPENAI_BASE_URL", None)
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured on server")

    start = time.time()
    client = get_ai_client(api_key, base_url)

    # Patch client with response_model to get structured output
    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert flashcard creator. Given the input text, generate exactly "
                        f"{req.num_cards} flashcards that test knowledge of the key concepts. "
                        "Each card should have a clear front (question/term) and back (answer/definition). "
                        "Add optional hints for complex concepts. Tag each card with relevant topic tags."
                    ),
                },
                {"role": "user", "content": req.text},
            ],
            response_model=CardBatch,
        )
        latency_ms = int((time.time() - start) * 1000)
        return GenerateResponse(
            cards=resp.cards,
            source_id=req.source_id,
            source_type=req.source_type,
            model_used=model,
            latency_ms=latency_ms,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@app.post("/generate/hf", response_model=GenerateResponse)
async def generate_cards_hf(req: GenerateRequest):
    """
    Generate flashcards using Hugging Face Inference API (FREE tier).
    No API key required — uses HF's free rate limits.
    
    Uses Qwen2.5-7B-Instruct model by default.
    Set HF_MODEL env var to use a different model.
    """
    hf_model = os.getenv("HF_MODEL", "Qwen/Qwen2.5-7B-Instruct")
    hf_token = os.getenv("HF_TOKEN", "")

    start = time.time()

    try:
        client = HFFlashcardClient(model=hf_model, token=hf_token)
        card_batch = client.generate(text=req.text, num_cards=req.num_cards)
        latency_ms = int((time.time() - start) * 1000)

        return GenerateResponse(
            cards=card_batch.cards,
            source_id=req.source_id,
            source_type=req.source_type,
            model_used=hf_model,
            latency_ms=latency_ms,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HF inference failed: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    authorization: Optional[str] = Header(None),
    x_subscription_key: Optional[str] = Header(None),
):
    """RAG-powered Q&A against document context."""
    # TODO: implement RAG pipeline with vector search
    return ChatResponse(
        answer=f"Placeholder answer for: {req.question}",
        citations=[],
        model_used="none",
    )


@app.post("/ingest/pdf")
async def ingest_pdf(file_url: str):
    """Ingest a PDF and extract text."""
    # TODO: PyMuPDF text extraction
    return {"source_id": "pdf_placeholder", "text": "", "pages": 0}


@app.post("/ingest/youtube")
async def ingest_youtube(url: str):
    """Ingest a YouTube video: download audio + Whisper transcription."""
    # TODO: yt-dlp + whisper
    return {"source_id": "yt_placeholder", "text": "", "duration_seconds": 0}


@app.post("/ingest/web")
async def ingest_web(url: str):
    """Ingest a web page: fetch HTML + extract text."""
    # TODO: Playwright or Firecrawl
    return {"source_id": "web_placeholder", "text": "", "title": ""}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
