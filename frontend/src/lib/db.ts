/**
 * OpenLearn — IndexedDB layer via Dexie.js
 * Browser-only storage for decks, cards, review logs, sources
 */

import Dexie, { type Table } from "dexie";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Deck {
  id?: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id?: number;
  deckId: number;
  front: string;
  back: string;
  hint: string;
  tags: string[];
  sourceId: number;
  // FSRS state
  fsrsState: string; // JSON serialized FSRS card state
  dueDate: Date | null;
  intervalSecs: number;
  easeFactor: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewLog {
  id?: number;
  cardId: number;
  rating: 1 | 2 | 3 | 4; // Again=1 Hard=2 Good=3 Easy=4
  reviewedAt: Date;
  elapsedSecs: number;
  intervalSecs: number;
  easeFactor: number;
}

export interface Source {
  id?: number;
  type: "pdf" | "youtube" | "web" | "text";
  url: string | null;
  title: string;
  content: string;
  createdAt: Date;
}

export interface Settings {
  key: string;
  value: string;
}

// ─── Database ─────────────────────────────────────────────────────────────────

class OpenLearnDB extends Dexie {
  decks!: Table<Deck>;
  cards!: Table<Card>;
  reviewLogs!: Table<ReviewLog>;
  sources!: Table<Source>;
  settings!: Table<Settings>;

  constructor() {
    super("OpenLearnDB");
    this.version(1).stores({
      decks: "++id, name, createdAt",
      cards: "++id, deckId, front, back, *tags, sourceId, dueDate",
      reviewLogs: "++id, cardId, rating, reviewedAt",
      sources: "++id, type, url, title, createdAt",
      settings: "key",
    });
  }
}

export const db = new OpenLearnDB();

// ─── Deck helpers ─────────────────────────────────────────────────────────────

export async function createDeck(name: string, description = ""): Promise<Deck> {
  const now = new Date();
  return db.decks.add({ name, description, createdAt: now, updatedAt: now });
}

export async function listDecks(): Promise<Deck[]> {
  return db.decks.orderBy("createdAt").reverse().toArray();
}

export async function getDeck(id: number): Promise<Deck | undefined> {
  return db.decks.get(id);
}

export async function updateDeck(id: number, data: Partial<Deck>): Promise<void> {
  await db.decks.update(id, { ...data, updatedAt: new Date() });
}

export async function deleteDeck(id: number): Promise<void> {
  await db.transaction("rw", db.decks, db.cards, db.reviewLogs, async () => {
    const cards = await db.cards.where("deckId").equals(id).toArray();
    const cardIds = cards.map((c) => c.id!);
    await db.reviewLogs.where("cardId").anyOf(cardIds).delete();
    await db.cards.where("deckId").equals(id).delete();
    await db.decks.delete(id);
  });
}

// ─── Card helpers ─────────────────────────────────────────────────────────────

export async function createCard(data: Omit<Card, "id" | "createdAt" | "updatedAt">): Promise<Card> {
  const now = new Date();
  return db.cards.add({
    ...data,
    createdAt: now,
    updatedAt: now,
  } as Card);
}

export async function listCards(deckId: number): Promise<Card[]> {
  return db.cards.where("deckId").equals(deckId).toArray();
}

export async function getDueCards(deckId: number): Promise<Card[]> {
  const now = new Date();
  return db.cards
    .where("deckId")
    .equals(deckId)
    .filter((card) => !card.dueDate || card.dueDate <= now)
    .toArray();
}

export async function updateCard(id: number, data: Partial<Card>): Promise<void> {
  await db.cards.update(id, { ...data, updatedAt: new Date() });
}

export async function deleteCard(id: number): Promise<void> {
  await db.transaction("rw", db.cards, db.reviewLogs, async () => {
    await db.reviewLogs.where("cardId").equals(id).delete();
    await db.cards.delete(id);
  });
}

// ─── Review log helpers ───────────────────────────────────────────────────────

export async function logReview(data: Omit<ReviewLog, "id">): Promise<ReviewLog> {
  return db.reviewLogs.add(data as ReviewLog);
}

// ─── Settings helpers ─────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.settings.get(key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}
