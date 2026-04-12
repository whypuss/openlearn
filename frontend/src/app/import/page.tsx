"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { listDecks, createDeck, createCard, type Deck } from "@/lib/db";
import { extractText } from "@/lib/pdf";
import { generateFlashcards, generatePracticeTest, type GeneratedCard, type GeneratedQuestion } from "@/lib/ai";
import { createInitialState } from "@/lib/scheduler";

type Mode = "flashcards" | "practice";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [newDeckName, setNewDeckName] = useState("");
  const [mode, setMode] = useState<Mode>("flashcards");
  const [step, setStep] = useState<"upload" | "preview" | "generating" | "done">("upload");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ cards: number; questions: number } | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load decks when entering preview step
  const loadDecks = useCallback(async () => {
    const all = await listDecks();
    setDecks(all);
    if (all.length > 0 && selectedDeckId === null && all[0].id !== undefined) {
      setSelectedDeckId(all[0].id);
    }
  }, [selectedDeckId]);

  function handleFileChange(f: File) {
    setFile(f);
    setError("");
    setResult(null);
  }

  async function handleExtract() {
    if (!file) return;
    setStep("preview");
    await loadDecks();
    try {
      const text = await extractText(file);
      setExtractedText(text.slice(0, 5000)); // cap at 5000 chars for AI
    } catch (e: any) {
      setError(e.message || "Failed to extract text");
      setStep("upload");
    }
  }

  async function handleCreateDeck() {
    if (!newDeckName.trim()) return;
    const deck = await createDeck(newDeckName.trim());
    setDecks((prev) => [deck, ...prev]);
    if (deck.id !== undefined) setSelectedDeckId(deck.id);
    setNewDeckName("");
  }

  async function handleGenerate() {
    if (!extractedText.trim() || selectedDeckId === null) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setStep("generating");
    setProgress(10);
    setError("");

    try {
      if (mode === "flashcards") {
        setProgress(30);
        const res = await generateFlashcards(extractedText, 10, abortRef.current.signal);
        setProgress(80);

        // Save cards to deck
        for (const card of res.cards) {
          const state = createInitialState();
          await createCard({
            deckId: selectedDeckId!,
            front: card.front,
            back: card.back,
            hint: card.hint ?? "",
            tags: card.tags,
            sourceId: 0,
            fsrsState: JSON.stringify(state),
            dueDate: new Date(),
            intervalSecs: 0,
            easeFactor: 2.5,
          });
        }
        setProgress(100);
        setResult({ cards: res.cards.length, questions: 0 });
      } else {
        setProgress(30);
        const res = await generatePracticeTest(extractedText, 5, abortRef.current.signal);
        setProgress(80);
        // For practice test: store questions as cards with special format
        for (const q of res.questions) {
          const state = createInitialState();
          const optionLabels = ["A", "B", "C", "D"].map((l, i) => `${l}. ${q.options[i]}`).join(" | ");
          await createCard({
            deckId: selectedDeckId!,
            front: `【Practice】${q.question}`,
            back: `答案: ${q.options[q.correctIndex]}\n\n💡 ${q.explanation}`,
            hint: optionLabels,
            tags: ["practice"],
            sourceId: 0,
            fsrsState: JSON.stringify(state),
            dueDate: new Date(),
            intervalSecs: 0,
            easeFactor: 2.5,
          });
        }
        setProgress(100);
        setResult({ cards: res.questions.length, questions: res.questions.length });
      }
      setStep("done");
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError(e.message || "Generation failed. Please try again.");
        setStep("preview");
      }
    }
  }

  function handleReset() {
    setFile(null);
    setExtractedText("");
    setStep("upload");
    setProgress(0);
    setError("");
    setResult(null);
    if (abortRef.current) abortRef.current.abort();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">Import & Generate</h1>
      <p className="text-[#A89585] text-sm mb-8">Upload a PDF or TXT file to generate flashcards or practice questions using AI.</p>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-6 animate-slide-up">
          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-[#E8DDD3] hover:border-indigo-500/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFileChange(f);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }}
            />
            <div className="text-4xl mb-3">📄</div>
            <div className="text-base font-medium mb-1">
              {file ? file.name : "Drop PDF or TXT file here"}
            </div>
            {file && (
              <div className="text-xs text-[#A89585] mt-1">{formatSize(file.size)}</div>
            )}
            {!file && (
              <>
                <div className="text-sm text-[#A89585] mt-1">or click to browse</div>
                <div className="text-xs text-[#A89585]/60 mt-2">Supports: .pdf, .txt</div>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          {file && (
            <button
              onClick={handleExtract}
              className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-semibold text-sm transition-all btn-glow"
            >
              Extract Text & Continue →
            </button>
          )}
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="space-y-5 animate-slide-up">
          {/* File info */}
          <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#E8DDD3] rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <div className="text-sm font-medium">{file?.name}</div>
                <div className="text-xs text-[#A89585]">{formatSize(file?.size ?? 0)}</div>
              </div>
            </div>
            <button onClick={handleReset} className="text-xs text-[#A89585] hover:text-red-400">✕</button>
          </div>

          {/* Extracted text preview */}
          <div>
            <div className="text-xs text-[#A89585] mb-1.5 uppercase tracking-wider">Extracted Text Preview</div>
            <div className="bg-[#FFFFFF] border border-[#E8DDD3] rounded-xl p-4 max-h-48 overflow-y-auto">
              <pre className="text-xs text-[#D6C5B5] whitespace-pre-wrap font-mono leading-relaxed">
                {extractedText || "(No text found in file)"}
              </pre>
            </div>
            {extractedText.length >= 5000 && (
              <div className="text-xs text-[#A89585] mt-1">Text capped at 5000 characters for AI processing.</div>
            )}
          </div>

          {/* Mode selection */}
          <div>
            <div className="text-xs text-[#A89585] mb-1.5 uppercase tracking-wider">Generate</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("flashcards")}
                className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                  mode === "flashcards"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                    : "border-[#E8DDD3] hover:border-indigo-500/50"
                }`}
              >
                🃏 Flashcards
                <div className="text-xs text-[#A89585] font-normal mt-1">10 cards generated</div>
              </button>
              <button
                onClick={() => setMode("practice")}
                className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                  mode === "practice"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                    : "border-[#E8DDD3] hover:border-indigo-500/50"
                }`}
              >
                📝 Practice Test
                <div className="text-xs text-[#A89585] font-normal mt-1">5 multiple choice</div>
              </button>
            </div>
          </div>

          {/* Deck selection */}
          <div>
            <div className="text-xs text-[#A89585] mb-1.5 uppercase tracking-wider">Save to Deck</div>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedDeckId ?? ""}
                onChange={(e) => setSelectedDeckId(Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-[#FFFFFF] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select a deck...</option>
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or create new deck..."
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateDeck()}
                className="flex-1 px-3 py-2 bg-[#FFFFFF] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500 placeholder:text-[#A89585]"
              />
              <button
                onClick={handleCreateDeck}
                disabled={!newDeckName.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-xl text-sm font-semibold text-black transition-all"
              >
                + New
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!extractedText.trim() || selectedDeckId === null}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all btn-glow"
          >
            Generate with AI
          </button>
        </div>
      )}

      {/* Step: Generating */}
      {step === "generating" && (
        <div className="space-y-6 animate-slide-up">
          <div className="text-center py-8">
            <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-base font-medium mb-1">
              {mode === "flashcards" ? "Generating flashcards..." : "Generating practice questions..."}
            </div>
            <div className="text-sm text-[#A89585]">
              First request may take 20-30 seconds (model loading)
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-[#FFFFFF] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-xs text-[#A89585]">{progress}%</div>

          <button
            onClick={() => { if (abortRef.current) abortRef.current.abort(); setStep("preview"); }}
            className="w-full py-3 border border-[#E8DDD3] hover:border-red-500/50 rounded-xl text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && result && (
        <div className="space-y-5 animate-slide-up">
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-lg font-bold mb-1">Done!</div>
            <div className="text-sm text-[#D6C5B5]">
              {mode === "flashcards"
                ? `Generated ${result.cards} flashcards`
                : `Generated ${result.questions} practice questions`}
            </div>
            <div className="text-xs text-[#A89585] mt-1">Added to deck</div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/decks/${selectedDeckId}`}
              className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-semibold text-sm text-center transition-all"
            >
              View Deck →
            </Link>
            <button
              onClick={handleReset}
              className="flex-1 py-3 border border-[#E8DDD3] hover:border-indigo-500/50 rounded-xl font-medium text-sm transition-colors"
            >
              Import Another
            </button>
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="mt-10 pt-6 border-t border-[#E8DDD3]/50">
        <Link href="/decks" className="text-sm text-[#A89585] hover:text-[#D6C5B5] transition-colors">← Back to Decks</Link>
      </div>
    </div>
  );
}
