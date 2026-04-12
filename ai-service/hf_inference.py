"""
Hugging Face Inference Client for OpenLearn
Supports free HF Inference API tier — no API key needed for basic usage.
"""
import json
import re
import os
from typing import Literal, Optional
from pydantic import BaseModel


class Flashcard(BaseModel):
    front: str
    back: str
    hint: Optional[str] = None
    tags: list[str] = []


class CardBatch(BaseModel):
    cards: list[Flashcard]
    source_id: str
    source_type: Literal["pdf", "youtube", "web", "text"]


class HFFlashcardClient:
    """
    Uses Hugging Face Inference API for structured flashcard generation.
    Free tier: 3 concurrent requests, rate-limited per minute.
    """

    HF_API_BASE = "https://api-inference.huggingface.co/models"

    def __init__(self, model: str = "Qwen/Qwen2.5-7B-Instruct", token: Optional[str] = None):
        self.model = model
        self.token = token or os.getenv("HF_TOKEN", "")
        self.api_url = f"{self.HF_API_BASE}/{model}"

    def _make_prompt(self, text: str, num_cards: int) -> str:
        return f"""You are an expert flashcard creator. Given the input text, generate exactly {num_cards} flashcards that test knowledge of the key concepts.
Each card should have:
- front: a clear question or term (in the same language as the content)
- back: a concise answer or definition
- hint: an optional brief hint for complex concepts (can be null)
- tags: array of relevant topic tags

IMPORTANT: Output ONLY valid JSON in this exact format, no markdown or explanation:
{{"cards": [{{"front": "...", "back": "...", "hint": "...", "tags": ["tag1", "tag2"]}}]}}

Input text:
{text}"""

    def generate(self, text: str, num_cards: int = 10) -> CardBatch:
        """
        Generate flashcards using HF Inference API.
        Falls back to a simpler parsing if JSON extraction fails.
        """
        try:
            import httpx
        except ImportError:
            import requests as httpx

        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        prompt = self._make_prompt(text, num_cards)

        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 1024,
                "temperature": 0.7,
                "return_full_text": False,
            },
            "options": {"use_cache": True, "wait_for_model": True},
        }

        # Use httpx for sync request
        try:
            import httpx
            with httpx.Client(timeout=120.0) as client:
                response = client.post(
                    self.api_url,
                    json=payload,
                    headers=headers,
                )
        except ImportError:
            import requests
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=120,
            )

        if response.status_code != 200:
            raise RuntimeError(f"HF API error {response.status_code}: {response.text}")

        result = response.json()

        # Handle different response formats
        if isinstance(result, list):
            generated_text = result[0].get("generated_text", "")
        elif isinstance(result, dict):
            generated_text = result.get("generated_text", result.get("content", str(result)))
        else:
            generated_text = str(result)

        # Extract JSON from response
        return self._parse_json(generated_text, text, num_cards)

    def _parse_json(self, generated_text: str, original_text: str, num_cards: int) -> CardBatch:
        """
        Extract and parse JSON from model output.
        Falls back to dummy cards if parsing fails.
        """
        # Try to find JSON in the output
        json_match = re.search(
            r'\{[\s\S]*"cards"[\s\S]*\}',
            generated_text
        )

        if json_match:
            try:
                data = json.loads(json_match.group())
                return CardBatch(**data)
            except (json.JSONDecodeError, Exception):
                pass

        # Try whole response as JSON
        try:
            data = json.loads(generated_text)
            return CardBatch(**data)
        except Exception:
            pass

        # Fallback: return placeholder with original text preserved
        # This ensures the app doesn't crash even if model misbehaves
        fallback_cards = [
            Flashcard(
                front=f"Card {i+1}: Review this content",
                back=f"Content: {original_text[:100]}...",
                hint="Could not parse AI response",
                tags=["fallback"],
            )
            for i in range(num_cards)
        ]
        return CardBatch(
            cards=fallback_cards,
            source_id="parse_error",
            source_type="text",
        )
