"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getDeck,
  updateDeck,
  deleteDeck,
  listCards,
  createCard,
  getDueCards,
  deleteCard,
  type Deck,
  type Card,
} from "@/lib/db";
import { createInitialState, parseSM2State, formatInterval } from "@/lib/scheduler";

export default function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const deckId = parseInt(id, 10);
  const router = useRouter();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [dueCards, setDueCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cards" | "add">("cards");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add card form
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [hint, setHint] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!deckId || isNaN(deckId)) return;
    Promise.all([
      getDeck(deckId),
      listCards(deckId),
      getDueCards(deckId),
    ]).then(([d, c, due]) => {
      setDeck(d ?? null);
      setCards(c);
      setDueCards(due);
      setLoading(false);
    });
  }, [deckId]);

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setSaving(true);
    const state = createInitialState();
    const card = await createCard({
      deckId,
      front: front.trim(),
      back: back.trim(),
      hint: hint.trim(),
      tags: [],
      sourceId: 0,
      fsrsState: JSON.stringify(state),
      dueDate: new Date(),
      intervalSecs: 0,
      easeFactor: 2.5,
    });
    setCards([...cards, card]);
    setDueCards([...dueCards, card]);
    setFront("");
    setBack("");
    setHint("");
    setSaving(false);
    setActiveTab("cards");
  }

  async function handleDeleteCard(cardId: number) {
    await deleteCard(cardId);
    setCards(cards.filter((c) => c.id !== cardId));
    setDueCards(dueCards.filter((c) => c.id !== cardId));
  }

  async function handleDeleteDeck() {
    await deleteDeck(deckId);
    router.push("/decks");
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#E8DDD3] rounded w-48" />
          <div className="h-4 bg-[#E8DDD3] rounded w-32" />
          <div className="h-40 bg-[#E8DDD3] rounded mt-8" />
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/decks" className="text-[#A89585] hover:text-[#D6C5B5] transition-colors text-sm">
              ← Decks
            </Link>
          </div>
          <h1 className="text-3xl font-bold truncate">{deck.name}</h1>
          {deck.description && (
            <p className="text-[#D6C5B5] text-sm mt-1">{deck.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {dueCards.length > 0 && (
            <Link
              href={`/review/${deckId}`}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-black/30 pulse-dot" />
              Review {dueCards.length}
            </Link>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-[#A89585] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete deck"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Total Cards", value: cards.length, icon: "📇", color: "text-indigo-400" },
          { label: "Due Today", value: dueCards.length, icon: "⏰", color: dueCards.length > 0 ? "text-amber-400" : "text-[#A89585]" },
          { label: "Mastered", value: cards.filter((c) => c.intervalSecs >= 21 * 86400).length, icon: "🏆", color: "text-green-400" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-[#FFFFFF] border border-[#E8DDD3] rounded-xl p-4 text-center">
            <div className="text-xl mb-1">{icon}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-[#A89585] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-[#FFFFFF] border border-[#E8DDD3] rounded-xl p-1">
        {[
          { id: "cards", label: `Cards (${cards.length})` },
          { id: "add", label: "Add Card" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as "cards" | "add")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-[#E8DDD3] text-[#F8FAFC]"
                : "text-[#A89585] hover:text-[#D6C5B5]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Add card form ───────────────────────────────────────────── */}
      {activeTab === "add" && (
        <form onSubmit={handleAddCard} className="bg-[#FFFFFF] border border-[#E8DDD3] rounded-2xl p-6 space-y-4 animate-slide-up">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Front <span className="text-red-400">*</span>
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Question or term..."
              rows={3}
              className="w-full px-4 py-3 bg-[#FFF5EB] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-[#A89585] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Back <span className="text-red-400">*</span>
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Answer or definition..."
              rows={3}
              className="w-full px-4 py-3 bg-[#FFF5EB] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-[#A89585] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Hint (optional)</label>
            <input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Optional clue..."
              className="w-full px-4 py-2.5 bg-[#FFF5EB] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-[#A89585]"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!front.trim() || !back.trim() || saving}
              className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-sm transition-all btn-glow"
            >
              {saving ? "Saving..." : "Add Card"}
            </button>
          </div>
        </form>
      )}

      {/* ── Card list ───────────────────────────────────────────────── */}
      {activeTab === "cards" && (
        <div className="space-y-3">
          {cards.length === 0 ? (
            <div className="text-center py-16 text-[#A89585]">
              <div className="text-4xl mb-3">📇</div>
              <p className="text-sm">No cards in this deck yet.</p>
              <button
                onClick={() => setActiveTab("add")}
                className="mt-3 text-indigo-400 hover:underline text-sm"
              >
                Add your first card →
              </button>
            </div>
          ) : (
            cards.map((card) => {
              const state = parseSM2State(card.fsrsState);
              const isDue = !card.dueDate || card.dueDate <= new Date();
              return (
                <div
                  key={card.id}
                  className="group bg-[#FFFFFF] border border-[#E8DDD3] hover:border-[#E8DDD3] rounded-xl p-4 flex gap-4 items-start transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isDue && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-xs">Due</span>
                      )}
                      <span className="text-xs text-[#A89585]">
                        {card.intervalSecs > 0 ? `Reviewed · ${formatInterval(card.intervalSecs)} interval` : "New"}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{card.front}</p>
                    <p className="text-xs text-[#A89585]">{card.back}</p>
                    {card.hint && (
                      <p className="text-xs text-[#A89585] mt-1 italic">💡 {card.hint}</p>
                    )}
                  </div>
                  <button
                    onClick={() => card.id && handleDeleteCard(card.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-[#A89585] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                    title="Delete card"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Delete confirm modal ────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-[#FFFFFF] border border-[#E8DDD3] rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
            <h2 className="text-lg font-semibold mb-2">Delete &ldquo;{deck.name}&rdquo;?</h2>
            <p className="text-sm text-[#D6C5B5] mb-6">
              This will permanently delete {cards.length} card{cards.length !== 1 ? "s" : ""} and all review history. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-[#E8DDD3] rounded-xl text-sm font-medium hover:bg-[#E8DDD3]/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDeck}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 rounded-xl text-sm font-medium text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
