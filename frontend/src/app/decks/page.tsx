"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listDecks, createDeck, type Deck } from "@/lib/db";
import { formatDistanceToNow } from "@/lib/utils";

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listDecks().then((d) => {
      setDecks(d);
      setLoading(false);
    });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const deck = await createDeck(newName.trim(), newDesc.trim());
    setDecks([deck, ...decks]);
    setNewName("");
    setNewDesc("");
    setShowNewModal(false);
    setCreating(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Decks</h1>
          <p className="text-[#D6C5B5] text-sm mt-1">{decks.length} deck{decks.length !== 1 ? "s" : ""} in your library</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-medium text-sm transition-all btn-glow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Deck
        </button>
      </div>

      {/* Deck grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#FFFFFF] border border-[#E8DDD3] rounded-2xl p-6 h-36 animate-pulse">
              <div className="h-4 bg-[#E8DDD3] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[#E8DDD3] rounded w-full mb-4" />
              <div className="h-3 bg-[#E8DDD3] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : decks.length === 0 ? (
        <EmptyState onCreateClick={() => setShowNewModal(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}

      {/* New Deck Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
          <div className="relative bg-[#FFFFFF] border border-[#E8DDD3] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h2 className="text-lg font-semibold mb-4">Create New Deck</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-[#D6C5B5] mb-1.5">Deck name</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Japanese Vocabulary"
                  className="w-full px-4 py-2.5 bg-[#FFF5EB] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-[#A89585]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#D6C5B5] mb-1.5">Description (optional)</label>
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What is this deck about?"
                  className="w-full px-4 py-2.5 bg-[#FFF5EB] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-[#A89585]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2.5 border border-[#E8DDD3] rounded-xl text-sm font-medium hover:bg-[#E8DDD3]/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || creating}
                  className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all btn-glow"
                >
                  {creating ? "Creating..." : "Create Deck"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DeckCard({ deck }: { deck: Deck }) {
  const [cardCount, setCardCount] = useState(0);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    if (!deck.id) return;
    import("@/lib/db").then(({ listCards, getDueCards }) => {
      listCards(deck.id!).then((cards) => setCardCount(cards.length));
      getDueCards(deck.id!).then((due) => setDueCount(due.length));
    });
  }, [deck.id]);

  return (
    <Link href={`/decks/${deck.id}`} className="group block">
      <div className="bg-[#FFFFFF] border border-[#E8DDD3] hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-200 h-full flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg">
            📚
          </div>
          {dueCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium">
              {dueCount} due
            </span>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-base mb-1 group-hover:text-indigo-300 transition-colors">
            {deck.name}
          </h3>
          {deck.description && (
            <p className="text-xs text-[#A89585] line-clamp-2">{deck.description}</p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between text-xs text-[#A89585]">
          <span>{cardCount} cards</span>
          <span>{formatDistanceToNow(deck.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF] border border-[#E8DDD3] flex items-center justify-center text-3xl mb-4">
        📚
      </div>
      <h3 className="text-lg font-semibold mb-2">No decks yet</h3>
      <p className="text-[#A89585] text-sm mb-8 max-w-xs">
        Create your first deck to start learning with spaced repetition.
      </p>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-medium text-sm transition-all btn-glow"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create Your First Deck
      </button>
    </div>
  );
}
