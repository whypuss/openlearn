"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { listDecks, createDeck, createCard, type Deck } from "@/lib/db";
import { extractText } from "@/lib/pdf";
import { generateFlashcards, generatePracticeTest, type GeneratedCard, type GeneratedQuestion } from "@/lib/ai";
import { createInitialState } from "@/lib/scheduler";

type Mode = "flashcards" | "practice";

export default function ImportPage() {
  const [mode, setMode] = useState<Mode>("flashcards");
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [newDeckName, setNewDeckName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ cards: number; questions: number } | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load decks once on mount
  const loadDecks = useCallback(async () => {
    const all = await listDecks();
    setDecks(all);
    if (all.length > 0 && selectedDeckId === null && all[0].id !== undefined) {
      setSelectedDeckId(all[0].id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load decks when entering the page
  useState(() => { loadDecks(); });

  async function handleFileExtract(f: File) {
    setFile(f);
    setError("");
    try {
      const text = await extractText(f);
      setInputText(text.slice(0, 8000));
    } catch (e: any) {
      setError(e.message || "Failed to extract text from file");
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
    if (!inputText.trim()) {
      setError("Please upload a file or paste some text first.");
      return;
    }
    if (selectedDeckId === null) {
      setError("Please select or create a deck first.");
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsGenerating(true);
    setProgress(0);
    setError("");

    try {
      if (mode === "flashcards") {
        setProgress(20);
        const res = await generateFlashcards(inputText, 10, abortRef.current.signal);
        setProgress(70);
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
        setProgress(20);
        const res = await generatePracticeTest(inputText, 5, abortRef.current.signal);
        setProgress(70);
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
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError(e.message || "Generation failed. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  }

  function handleReset() {
    setInputText("");
    setFile(null);
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
      <p className="text-[#A89585] text-sm mb-8">Upload a PDF or paste text, then choose what to generate.</p>

      {/* ── Source: File or Text ── */}
      <div className="space-y-4 mb-6">
        <div className="text-xs text-[#A89585] mb-1.5 uppercase tracking-wider">Step 1 — Source</div>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-[#E8DDD3] hover:border-indigo-500/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFileExtract(f);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileExtract(f); }}
          />
          <div className="text-3xl mb-2">{file ? "📄" : "📂"}</div>
          <div className="text-sm font-medium">
            {file ? file.name : "Drop PDF or TXT here, or click to browse"}
          </div>
          {file && <div className="text-xs text-[#A89585] mt-1">{formatSize(file.size)}</div>}
          {!file && <div className="text-xs text-[#A89585]/60 mt-1">PDF or plain text</div>}
        </div>

        {/* Or paste text */}
        <div className="relative">
          <div className="absolute left-3 top-3 text-xs text-[#A89585] uppercase tracking-wider">Or paste text</div>
          <textarea
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setFile(null); }}
            placeholder="Paste any text here to generate flashcards from it..."
            rows={5}
            className="w-full pt-8 px-4 py-3 bg-[#FFFFFF] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
          {inputText.length > 0 && (
            <div className="absolute bottom-2 right-3 text-xs text-[#A89585]">{inputText.length} chars</div>
          )}
        </div>
      </div>

      {/* ── Mode Selection ── */}
      <div className="space-y-3 mb-6">
        <div className="text-xs text-[#A89585] mb-1.5 uppercase tracking-wider">Step 2 — What to generate</div>
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
            <div className="text-xs text-[#A89585] font-normal mt-1">10 cards from your text</div>
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
            <div className="text-xs text-[#A89585] font-normal mt-1">5 multiple choice questions</div>
          </button>
        </div>
      </div>

      {/* ── Deck Selection ── */}
      <div className="space-y-2 mb-6">
        <div className="text-xs text-[#A89585] mb-1.5 uppercase tracking-wider">Step 3 — Save to deck</div>
        <div className="flex gap-2">
          <select
            value={selectedDeckId ?? ""}
            onChange={(e) => setSelectedDeckId(Number(e.target.value))}
            onFocus={loadDecks}
            className="flex-1 px-3 py-2.5 bg-[#FFFFFF] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500"
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

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
      )}

      {/* ── Generating ── */}
      {isGenerating && (
        <div className="mb-4 space-y-3">
          <div className="text-center py-4">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-sm font-medium">
              {mode === "flashcards" ? "Generating flashcards..." : "Generating practice questions..."}
            </div>
            <div className="text-xs text-[#A89585] mt-1">First request may take 20-30 seconds</div>
          </div>
          <div className="h-2 bg-[#FFFFFF] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            onClick={() => { if (abortRef.current) abortRef.current.abort(); setIsGenerating(false); }}
            className="w-full py-2 border border-[#E8DDD3] hover:border-red-500/50 rounded-xl text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Done ── */}
      {result && !isGenerating && (
        <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center space-y-3">
          <div className="text-3xl">✅</div>
          <div className="text-base font-bold">
            {mode === "flashcards" ? `${result.cards} flashcards created!` : `${result.questions} questions created!`}
          </div>
          <div className="flex gap-3">
            <Link
              href={`/decks/${selectedDeckId}`}
              className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-semibold text-sm text-white text-center transition-all"
            >
              View Deck →
            </Link>
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 border border-[#E8DDD3] hover:border-indigo-500/50 rounded-xl font-medium text-sm transition-colors"
            >
              New Import
            </button>
          </div>
        </div>
      )}

      {/* ── Generate Button ── */}
      {!result && !isGenerating && (
        <button
          onClick={handleGenerate}
          disabled={!inputText.trim() || selectedDeckId === null}
          className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all btn-glow"
        >
          {inputText.trim() && selectedDeckId !== null
            ? `Generate ${mode === "flashcards" ? "Flashcards" : "Practice Test"} with AI →`
            : "Upload or paste text, then select a deck"}
        </button>
      )}

      {/* Nav */}
      <div className="mt-10 pt-6 border-t border-[#E8DDD3]/50">
        <Link href="/decks" className="text-sm text-[#A89585] hover:text-[#D6C5B5] transition-colors">← Back to Decks</Link>
      </div>
    </div>
  );
}
