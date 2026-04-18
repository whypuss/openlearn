# OpenLearn Local

Offline-first flashcard app for language learning. No backend required.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Vue 3 SPA (Capacitor → Android/iOS)       │
│                                             │
│  ┌──────────┐    ┌─────────────────────┐  │
│  │  Dexie   │    │  AI API (user-provided key)  │
│  │ (local)  │    │  OpenRouter / HuggingFace   │
│  └──────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────┘
```

- **Storage**: Dexie.js (IndexedDB) — all data stored locally
- **AI Generation**: Direct API calls to OpenRouter or HuggingFace Inference API
- **Backend**: Not required — fully offline capable
- **FSRS**: Spaced repetition algorithm runs entirely in-browser

## Tech Stack

- Vue 3 + TypeScript + Vite
- Dexie 4 (IndexedDB wrapper)
- TailwindCSS
- Capacitor (mobile packaging)

## Setup

```bash
cd vue-frontend
npm install
npm run dev        # development
npm run build      # production build
```

## Mobile Build

```bash
npm run build
npx cap sync android    # sync to Android
cd android
./gradlew assembleDebug  # build APK
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

## AI Configuration

1. Go to Settings in the app
2. Choose provider (OpenRouter or HuggingFace)
3. Enter your API key
4. AI generation works completely offline from the app's perspective

## Data Model

- **Books** → contain Decks
- **Decks** → contain Cards
- **Cards** → front/back/hints, FSRS state, due date
- **Sources** → PDF content, YouTube, web text, raw text
- **ReviewLogs** → spaced repetition history

## Development Notes

- All CRUD operations go through `src/lib/db.ts` (Dexie)
- AI calls are in `src/views/HomeView.vue` → `callAI()`
- Settings stored in Dexie `settings` table
- No backend server required for any feature
