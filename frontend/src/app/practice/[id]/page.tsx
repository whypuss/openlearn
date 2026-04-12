"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { getDeck, type Deck } from "@/lib/db";
import { generatePracticeTest, type GeneratedQuestion } from "@/lib/ai";

type TestState = "input" | "testing" | "results";

export default function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const deckId = parseInt(id, 10);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [testState, setTestState] = useState<TestState>("input");
  const [sourceText, setSourceText] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!deckId || isNaN(deckId)) return;
    getDeck(deckId).then((d) => {
      setDeck(d ?? null);
      setLoading(false);
    });
  }, [deckId]);

  async function handleGenerate() {
    if (!sourceText.trim()) return;
    setError("");
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setGenerating(true);
    try {
      const result = await generatePracticeTest(sourceText.trim(), numQuestions, abortRef.current.signal);
      setQuestions(result.questions);
      setAnswers(new Array(result.questions.length).fill(null));
      setTestState("testing");
      setCurrentQ(0);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError(e.message || "Generation failed. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  }

  function handleSelect(optionIndex: number) {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setTestState("results");
    }
  }

  function handlePrev() {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  }

  const score = questions.reduce((acc, q, i) => {
    return acc + (answers[i] === q.correctIndex ? 1 : 0);
  }, 0);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 flex justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 text-center">
        <p className="text-[#D6C5B5]">Deck not found.</p>
        <Link href="/decks" className="text-indigo-400 hover:underline mt-2 inline-block">← Back</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/decks/${deckId}`} className="text-[#A89585] hover:text-[#D6C5B5] text-sm">← {deck.name}</Link>
      </div>
      <h1 className="text-2xl font-bold mb-2">Practice Test</h1>
      <p className="text-[#A89585] text-sm mb-8">AI-generated multiple choice questions based on your content.</p>

      {/* Input State */}
      {testState === "input" && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-[#FFFFFF] border border-[#E8DDD3] rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Paste study material or exam content</label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste Japanese text, grammar notes, vocabulary lists, or past exam questions here..."
                rows={10}
                className="w-full px-4 py-3 bg-[#FFF5EB] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-[#A89585] resize-none font-mono"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-[#A89585]">Number of questions:</label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="px-3 py-1.5 bg-[#FFF5EB] border border-[#E8DDD3] rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              >
                {[3, 5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!sourceText.trim() || generating}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all btn-glow flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating questions...
              </>
            ) : (
              <>Generate {numQuestions} Questions</>
            )}
          </button>

          {generating && (
            <p className="text-center text-xs text-[#A89585]">
              First request may take 20-30 seconds (model loading). Subsequent requests are faster.
            </p>
          )}
        </div>
      )}

      {/* Testing State */}
      {testState === "testing" && questions.length > 0 && (
        <div className="space-y-6 animate-slide-up">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-[#A89585]">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>{answers.filter((a) => a !== null).length} answered</span>
          </div>
          <div className="h-1.5 bg-[#FFFFFF] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-[#FFFFFF] border border-[#E8DDD3] rounded-2xl p-6">
            <div className="text-xs text-indigo-400 mb-3 uppercase tracking-wider">Question</div>
            <div className="text-lg font-medium leading-relaxed mb-6">{questions[currentQ].question}</div>

            <div className="space-y-3">
              {questions[currentQ].options.map((option, i) => {
                const isSelected = answers[currentQ] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm flex items-center gap-3 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                        : "border-[#E8DDD3] hover:border-indigo-500/50 text-[#D6C5B5]"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? "border-indigo-500 bg-indigo-500 text-white" : "border-[#E8DDD3]"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={currentQ === 0}
              className="flex-1 py-3 border border-[#E8DDD3] hover:border-indigo-500/50 rounded-xl font-medium text-sm transition-colors disabled:opacity-30"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={answers[currentQ] === null}
              className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all"
            >
              {currentQ < questions.length - 1 ? "Next →" : "See Results"}
            </button>
          </div>
        </div>
      )}

      {/* Results State */}
      {testState === "results" && (
        <div className="space-y-6 animate-slide-up">
          {/* Score Banner */}
          <div className={`rounded-2xl p-6 text-center ${score / questions.length >= 0.7 ? "bg-green-500/10 border border-green-500/30" : "bg-amber-500/10 border border-amber-500/30"}`}>
            <div className={`text-5xl font-bold mb-2 ${score / questions.length >= 0.7 ? "text-green-400" : "text-amber-400"}`}>
              {score}/{questions.length}
            </div>
            <div className="text-[#D6C5B5] text-sm">
              {score / questions.length >= 0.8 ? "Excellent! 🎉" : score / questions.length >= 0.6 ? "Good job! 👍" : "Keep practicing! 💪"}
            </div>
            <div className="text-[#A89585] text-xs mt-1">
              {Math.round((score / questions.length) * 100)}% correct · AI model: Qwen2.5-7B
            </div>
          </div>

          {/* Review */}
          <div className="space-y-4">
            <h2 className="font-semibold text-base">Review Answers</h2>
            {questions.map((q, i) => {
              const userAnswer = answers[i];
              const isCorrect = userAnswer === q.correctIndex;
              return (
                <div key={i} className={`bg-[#FFFFFF] border rounded-xl p-5 ${isCorrect ? "border-green-500/30" : "border-red-500/30"}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                      {isCorrect ? "✓" : "✗"}
                    </span>
                    <div className="text-sm font-medium leading-relaxed">{q.question}</div>
                  </div>
                  <div className="text-xs text-[#A89585] mb-2">
                    Your answer: {userAnswer !== null ? q.options[userAnswer] : "Not answered"}
                    {!isCorrect && <> · Correct: <span className="text-green-400">{q.options[q.correctIndex]}</span></>}
                  </div>
                  <div className="text-xs text-indigo-300 bg-indigo-500/10 rounded-lg px-3 py-2">
                    💡 {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setTestState("input")}
              className="flex-1 py-3 border border-[#E8DDD3] hover:border-indigo-500/50 rounded-xl font-medium text-sm transition-colors"
            >
              Try Another
            </button>
            <Link
              href={`/decks/${deckId}`}
              className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-semibold text-sm text-center transition-all"
            >
              Back to Deck
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
