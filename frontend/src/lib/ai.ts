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

const HF_API_BASE = "https://api-inference.huggingface.co/models";
const DEFAULT_MODEL = "Qwen/Qwen2.5-7B-Instruct";

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
  const match = text.match(/\{[\s\S]*"cards"[\s\S]*\}|\{[\s\S]*"questions"[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch { /* fall through */ }
  }
  try { return JSON.parse(text); } catch { /* fall through */ }
  return null;
}

async function hfGenerate(prompt: string, maxTokens: number, signal?: AbortSignal): Promise<string> {
  const response = await fetch(`${HF_API_BASE}/${DEFAULT_MODEL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: maxTokens, temperature: 0.7, return_full_text: false },
      options: { use_cache: true, wait_for_model: true },
    }),
    signal,
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF API error ${response.status}: ${err}`);
  }
  const result = await response.json();
  if (Array.isArray(result)) return result[0]?.generated_text ?? "";
  if (typeof result === "object") return result.generated_text ?? result.content ?? JSON.stringify(result);
  return String(result);
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
