"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  getDeck,
  getDueCards,
  updateCard,
  logReview,
  type Deck,
  type Card,
} from "@/lib/db";
import {
  schedule,
  parseSM2State,
  createInitialState,
  formatInterval,
  applySchedule,
  RatingLabel,
  RatingColor,
  RatingBg,
  type RatingValue,
} from "@/lib/scheduler";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const deckId = parseInt(id, 10);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [queue, setQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const currentCard = queue[currentIndex];

  useEffect(() => {
    if (!deckId || isNaN(deckId)) return;
    Promise.all([getDeck(deckId), getDueCards(deckId)]).then(([d, dueCards]) => {
      setDeck(d ?? null);
      setQueue(dueCards);
      setLoading(false);
      if (dueCards.length === 0) setCompleted(true);
    });
  }, [deckId]);

  const handleRate = useCallback(
    async (rating: RatingValue) => {
      if (!currentCard?.id) return;

      const state = parseSM2State(currentCard.fsrsState);
      const result = schedule(state, rating);
      const newState = applySchedule(state, result);

      await updateCard(currentCard.id, {
        fsrsState: JSON.stringify(newState),
        dueDate: result.dueDate,
        intervalSecs: result.intervalDays * 86400,
        easeFactor: result.easeFactor,
      });

      await logReview({
        cardId: currentCard.id,
        rating,
        reviewedAt: new Date(),
        elapsedSecs: currentCard.intervalSecs,
        intervalSecs: result.intervalDays * 86400,
        easeFactor: result.easeFactor,
      });

      setSessionStats((s) => ({ ...s, [RatingLabel[rating].toLowerCase()]: s[RatingLabel[rating].toLowerCase() as keyof typeof s] + 1 }));
      setFlipped(false);

      if (currentIndex + 1 >= queue.length) {
        setCompleted(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [currentCard, currentIndex, queue.length]
  );

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (completed || loading) return;
      if (!flipped) {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          setFlipped(true);
        }
      } else {
        if (e.key === "1") handleRate(1);
        if (e.key === "2") handleRate(2);
        if (e.key === "3") handleRate(3);
        if (e.key === "4") handleRate(4);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, handleRate, completed, loading]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[#A89585] text-sm">Loading cards...</p>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 text-center">
        <p className="text-[#D6C5B5]">Deck not found.</p>
        <Link href="/decks" className="text-indigo-400 hover:underline mt-2 inline-block">← Back to decks</Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
        <p className="text-[#D6C5B5] mb-8">
          You reviewed {queue.length} card{queue.length !== 1 ? "s" : ""} in this session.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-10 w-full max-w-xs">
          {Object.entries(sessionStats).map(([key, count]) =>
            count > 0 ? (
              <div key={key} className="bg-[#FFFFFF] border border-[#E8DDD3] rounded-xl px-4 py-3 text-center">
                <div className={`text-xl font-bold capitalize ${RatingColor[key as unknown as RatingValue] || "text-white"}`}>{count}</div>
                <div className="text-xs text-[#A89585] capitalize">{key}</div>
              </div>
            ) : null
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/decks/${deckId}`}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-medium text-sm transition-all"
          >
            Back to Deck
          </Link>
          <Link
            href="/decks"
            className="px-6 py-3 border border-[#E8DDD3] hover:border-indigo-500/50 rounded-xl font-medium text-sm transition-colors"
          >
            All Decks
          </Link>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex) / queue.length) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col px-6 py-8 max-w-2xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/decks/${deckId}`}
          className="flex items-center gap-1.5 text-sm text-[#A89585] hover:text-[#D6C5B5] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {deck.name}
        </Link>
        <span className="text-sm text-[#A89585]">
          {currentIndex + 1} / {queue.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#FFFFFF] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Flashcard ──────────────────────────────────────────────── */}
      <div
        className="card-container flex-1 cursor-pointer"
        onClick={() => !flipped && setFlipped(true)}
        style={{ minHeight: "280px" }}
      >
        <div className={`card-inner ${flipped ? "flipped" : ""}`} style={{ height: "100%" }}>

          {/* Front */}
          <div className="card-front">
            <div className="w-full">
              <div className="text-xs text-[#A89585] mb-4 uppercase tracking-wider">Question</div>
              <div className="text-xl sm:text-2xl font-medium leading-relaxed">{currentCard.front}</div>
              {currentCard.hint && (
                <div className="mt-4 text-sm text-[#A89585]">💡 Hint: {currentCard.hint}</div>
              )}
              <div className="mt-8 text-xs text-[#E8DDD3]">Tap to reveal answer</div>
            </div>
          </div>

          {/* Back */}
          <div className="card-back">
            <div className="w-full">
              <div className="text-xs text-indigo-400 mb-4 uppercase tracking-wider">Answer</div>
              <div className="text-xl sm:text-2xl font-medium leading-relaxed mb-6">{currentCard.back}</div>
              {currentCard.hint && (
                <div className="text-sm text-[#A89585] mb-4">💡 {currentCard.hint}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Rating buttons ─────────────────────────────────────────── */}
      <div className="mt-6">
        {!flipped ? (
          <button
            onClick={() => setFlipped(true)}
            className="w-full py-4 bg-[#FFFFFF] border border-[#E8DDD3] hover:border-indigo-500/50 rounded-xl font-semibold text-base transition-all"
          >
            Show Answer
            <span className="ml-3 text-xs text-[#A89585]">Space / Enter</span>
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {([1, 2, 3, 4] as RatingValue[]).map((rating) => (
              <button
                key={rating}
                onClick={() => handleRate(rating)}
                className={`py-3.5 rounded-xl font-semibold text-sm border transition-all flex flex-col items-center gap-0.5 ${RatingBg[rating]}`}
              >
                <span>{RatingLabel[rating]}</span>
                <span className="text-xs opacity-60 font-normal">
                  {rating === 1 ? "<1m" : rating === 2 ? "~1d" : rating === 3 ? "~4d" : "~7d"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      {flipped && (
        <p className="text-center text-xs text-[#E8DDD3] mt-3">
          1=Again · 2=Hard · 3=Good · 4=Easy
        </p>
      )}
    </div>
  );
}
