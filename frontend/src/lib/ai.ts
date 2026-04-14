/**
 * Hugging Face Inference API client for flashcard + test generation
 * Uses free tier — no API key required
 */

export interface GeneratedCard {
  front: string;
  back: string;
  hint?: string;
  tags: string[];
}

export interface GeneratedQuestion {
  question: string;
  options: string[];      // 4 options, A-D
  correctIndex: number;   // 0-3
  explanation: string;
}

export interface GenerationResult {
  cards: GeneratedCard[];
  model: string;
  latencyMs: number;
}

export interface TestResult {
  questions: GeneratedQuestion[];
  model: string;
  latencyMs: number;
}

const BACKEND_URL = "https://openlearn-backend-181179752596.us-central1.run.app";

// ─── Flashcard generation ───────────────────────────────────

function buildFlashcardPrompt(text: string, numCards: number): string {
  return `You are an expert flashcard creator. Given the input text, generate exactly ${numCards} flashcards that test knowledge of the key concepts.
Each card should have:
- front: a clear question or term (in the same language as the content)
- back: a concise answer or definition
- hint: an optional brief hint for complex concepts (can be null)
- tags: array of relevant topic tags

IMPORTANT: Output ONLY valid JSON in this exact format, no markdown or explanation:
{"cards": [{"front": "...", "back": "...", "hint": "...", "tags": ["tag1", "tag2"]}]}

Input text:
${text}`;
}

function buildTestPrompt(text: string, numQuestions: number): string {
  return `You are an expert Japanese language teacher. Based on the input text, generate exactly ${numQuestions} multiple choice practice questions suitable for JLPT N5-N4 level.
Each question must have:
- question: the question text in Japanese (with furigana hints if needed)
- options: exactly 4 choices labeled A through D (the correct answer should be mixed in position)
- correctIndex: the index (0-3) of the correct answer
- explanation: a brief explanation in Japanese or Korean explaining why the answer is correct

IMPORTANT: Output ONLY valid JSON in this exact format, no markdown or explanation:
{"questions": [{"question": "...", "options": ["A: ...", "B: ...", "C: ...", "D: ..."], "correctIndex": 0, "explanation": "..."}]}

Input text:
${text}`;
}

function extractJson(text: string): any {
  // Strategy 1: extract from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try { return JSON.parse(codeBlockMatch[1].trim()); } catch { /* fall through */ }
  }

  // Strategy 2: find first { ... } containing "cards" or "questions"
  // Use a bracket-counting approach to find the matching closing brace
  const jsonStart = text.indexOf("{");
  if (jsonStart !== -1) {
    let depth = 0;
    let end = -1;
    for (let i = jsonStart; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end !== -1) {
      const json = text.slice(jsonStart, end + 1);
      try {
        const parsed = JSON.parse(json);
        if (parsed?.cards || parsed?.questions) return parsed;
      } catch { /* try next approach */ }
    }
  }

  // Strategy 3: try raw parse
  try { return JSON.parse(text.trim()); } catch { /* fall through */ }
  return null;
}

// Lazy-load backend URL (set by window.__OPENLEARN_BACKEND__ injected by deploy)
function getBackendUrl(): string {
  if (typeof window !== "undefined" && (window as any).__OPENLEARN_BACKEND__) {
    return (window as any).__OPENLEARN_BACKEND__;
  }
  return BACKEND_URL;
}

const DEFAULT_MODEL = "qwen/qwen-2.5-7b-instruct";

async function hfGenerate(prompt: string, maxTokens: number, signal?: AbortSignal): Promise<string> {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      max_tokens: maxTokens,
      model: DEFAULT_MODEL,
    }),
    signal,
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Backend error ${response.status}: ${err}`);
  }
  return response.text();
}

// ─── Public API ─────────────────────────────────────────────

export async function generateFlashcards(
  text: string,
  numCards: number = 10,
  signal?: AbortSignal
): Promise<GenerationResult> {
  const start = performance.now();
  const generatedText = await hfGenerate(buildFlashcardPrompt(text, numCards), 1024, signal);
  const data = extractJson(generatedText);
  const cards: GeneratedCard[] = Array.isArray(data?.cards) ? data.cards
    : Array.isArray(data) ? data
    : [];
  if (!cards.length) throw new Error("Failed to parse flashcards. Please try again.");
  return { cards, model: DEFAULT_MODEL, latencyMs: Math.round(performance.now() - start) };
}

export async function generatePracticeTest(
  text: string,
  numQuestions: number = 5,
  signal?: AbortSignal
): Promise<TestResult> {
  const start = performance.now();
  const generatedText = await hfGenerate(buildTestPrompt(text, numQuestions), 2048, signal);
  const data = extractJson(generatedText);
  const questions: GeneratedQuestion[] = Array.isArray(data?.questions) ? data.questions : [];
  if (!questions.length) throw new Error("Failed to parse questions. Please try again.");
  return { questions, model: DEFAULT_MODEL, latencyMs: Math.round(performance.now() - start) };
}
