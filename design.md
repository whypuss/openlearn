# OpenLearn — 開源 AI 知識庫 + 間隔複習系統

> From source to mastery, open forever.
> 完全開源的 AI 知識工作區 — 上傳文檔，生成卡片，達到精通

---

## 1. 願景與範圍

**目標：** 打造一個完全開源的 AI 知識工作空間，讓用戶上傳文檔（PDF/視頻/網頁/文本），與 AI 對話，並從中生成間隔複習卡片（Flashcards），達到「從源頭到精通」。

**核心功能：**
- 多格式文檔攝入（PDF、YouTube、網頁、文本）
- AI 對話式 QA（基於文檔內容，有引用）
- AI 自動生成卡片（FSRS 驅動的間隔複習）
- 卡片回憶練習（翻轉卡片 / Column View / Typing View）
- BYOK（自備 API Key）或官方訂閱

**不做（不在 MVP）：**
- 多人協作 / 團隊功能（但未來可擴展）
- 付費牆 / 訂閱系統
- 移動端 App（Web 優先）

---

## 2. 雙模式架構

OpenLearn 支持兩種運行模式，共享同一套前端代碼：

### 模式 A：瀏覽器單機模式（Browser-only）

```
┌─────────────────────────────────────────────────────────┐
│                    你的瀏覽器                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (同一份代碼)                       │  │
│  │  ┌──────────────────┐  ┌─────────────────────────┐  │  │
│  │  │  IndexedDB       │  │  FSRS Scheduler         │  │  │
│  │  │  (Dexie.js)      │  │  (fsrs.js, 前端實現)    │  │  │
│  │  │                  │  │                         │  │  │
│  │  │  儲存：           │  │  調度：                 │  │  │
│  │  │  - 牌組           │  │  - Again/Hard/Good/Easy │  │  │
│  │  │  - 卡片           │  │  - 下次複習時間         │  │  │
│  │  │  - 複習歷史       │  │  - 記憶狀態追蹤         │  │  │
│  │  │  - 文檔原始內容   │  │                         │  │  │
│  │  └──────────────────┘  └─────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**特點：**
- 零部署：打開 `index.html` 或 `localhost:3000` 即可使用
- 隱私最好：所有資料存在本地瀏覽器，永不離開設備
- 無需網路：離線也能複習
- AI 功能可選：可接入本地 LLM（如 Ollama）或雲端 AI API

---

### 模式 B：雲端三層模式（Cloud-enabled）

```
┌─────────────────────────────────────────────────────────┐
│                    你的瀏覽器                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (同一份代碼)                       │  │
│  │  - IndexedDB 作為本地緩存（離線支援）                 │  │
│  │  - FSRS 前端調度                                    │  │
│  │  - 自動與後端同步                                   │  │
│  └──────────────────┬──────────────────────────────┘  │
│                     │ HTTP REST (JSON)                  │
│         ┌───────────┴───────────┐                       │
│         │   AI Service (可選)    │                       │
│         │  FastAPI + instructor  │                       │
│         │  Port 8000              │                       │
│         │                          │                       │
│         │  支援 BYOK：             │                       │
│         │  - OpenAI API Key       │                       │
│         │  - Anthropic API Key     │                       │
│         │  - 本地 Ollama           │                       │
│         │  - Groq /其他           │                       │
│         │                          │                       │
│         │  官方訂閱（官方 API）：   │                       │
│         │  - 官方代付費用         │                       │
│         └──────────────────────────┘                       │
│                         │                                 │
│         ┌───────────────┴───────────────┐                 │
│         │     Rust Backend (可選)         │                 │
│         │  Loco-rs + SQLite/Postgres     │                 │
│         │  Port 8080                       │                 │
│         │                                   │                 │
│         │  負責：                           │                 │
│         │  - 多設備同步                     │                 │
│         │  - 牌組/卡片持久化                │                 │
│         │  - 用戶認證                       │                 │
│         └───────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

**特點：**
- 跨設備同步：筆記、卡片、進度在所有設備間同步
- 完整 AI 功能：PDF 解析、YouTube 轉錄、RAG 對話
- BYOK：使用者自備 API Key，官方完全不接觸
- 官方訂閱：官方代付 API 費用，無需自己管理 Key
- 可自部署：所有組件都可運行在自有服務器

---

### BYOK vs 官方訂閱

| 維度 | BYOK（自備 Key） | 官方訂閱 |
|------|-----------------|---------|
| API Key | 用戶自己提供 | 官方提供（代付） |
| 費用 | 按 OpenAI/Anthropic 官網價 | 官方定價（透明） |
| 隱私 | AI API 直連，資料可能經過第三方 | 同上 |
| 便利性 | 需自己管理 Key | 即開即用 |
| 發票 | 自己對應 AI Provider | 官方統一發票 |

**官方訂閱的技術實現：**
- 用戶在官方網站購買訂閱，獲得 `subscription_key`
- 前端/AI Service 使用 `subscription_key` 而非 `OPENAI_API_KEY`
- 後端驗證 `subscription_key` 的有效性 + 配額
- 官方定期與 AI Provider 結算（中間不賺差價，只收服務費）

---

### 雙模式對比

| 維度 | 瀏覽器單機 | 雲端三層 |
|------|-----------|---------|
| 部署成本 | 零 | 需伺服器（可自部署） |
| 隱私 | 最高（資料永不離開設備） | 高（可完全自部署） |
| 跨設備同步 | 否 | 是 |
| PDF/YouTube 解析 | 需要 AI API | 本地 AI Service |
| AI 卡片生成 | 需要 AI API | 本地 AI Service |
| 離線使用 | 完全支援 | 部分支援 |
| 多人協作 | 否 | 未來支援 |
| API Key 管理 | 用戶自己管理 | BYOK 或官方訂閱 |

**共用代碼：** 前端 100% 共用，通過環境變量切換模式

---

## 3. 技術架構

### 前端：Next.js + Tailwind + Tiptap + Dexie.js

```
frontend/
├── app/
│   ├── (app)/              # 主要應用
│   │   ├── library/        # 文檔庫（攝入入口）
│   │   ├── chat/           # AI QA 對話
│   │   ├── cards/          # 卡片管理
│   │   └── review/         # 複習模式
│   └── api/
│       ├── ai/             # AI Service 代理
│       └── sync/           # 後端同步代理（雲端模式）
├── lib/
│   ├── db.ts               # IndexedDB (Dexie.js) 封裝
│   ├── fsrs.ts             # FSRS 前端調度（fsrs.js）
│   ├── sync.ts             # 同步邏輯（雲端模式）
│   └── api-key.ts          # API Key 管理（BYOK / 官方訂閱）
└── components/
    ├── editor/             # Tiptap 編輯器
    ├── deck/               # 牌組 UI
    └── review/             # 複習 UI
```

**API Key 管理（`lib/api-key.ts`）：**
```typescript
type ApiKeyMode =
  | { mode: "byok"; provider: "openai" | "anthropic" | "ollama" | "groq"; apiKey: string }
  | { mode: "official"; subscriptionKey: string }
  | { mode: "none" }; // 純離線模式

function getAIConfig(): ApiKeyMode {
  const mode = localStorage.getItem("ai_mode") || "none";
  if (mode === "byok") {
    return {
      mode: "byok",
      provider: localStorage.getItem("ai_provider") as any,
      apiKey: localStorage.getItem("ai_api_key")!,
    };
  }
  if (mode === "official") {
    return { mode: "official", subscriptionKey: localStorage.getItem("sub_key")! };
  }
  return { mode: "none" };
}
```

---

### AI Service：Python FastAPI + instructor

```
ai-service/
├── main.py                  # FastAPI 入口
├── routers/
│   ├── ingest.py           # 文檔攝入（PDF/YouTube/網頁）
│   ├── generate.py         # 卡片生成（instructor）
│   └── chat.py             # RAG 對話
├── processors/
│   ├── pdf.py              # PyMuPDF 文本提取
│   ├── youtube.py          # yt-dlp + Whisper
│   └── web.py             # Firecrawl/Playwright
├── extraction/
│   └── card_schema.py      # instructor Pydantic Schema
└── auth/
    ├── byok.py             # BYOK 驗證（直接轉發到 AI Provider）
    └── official.py         # 官方訂閱驗證（配額檢查）
```

**BYOK 流程：**
```
用戶輸入 API Key → 前端保存到 localStorage → 請求時附加 Authorization header
AI Service 直接轉發到 OpenAI/Anthropic API → 官方不接觸用戶資料
```

**官方訂閱流程：**
```
用戶輸入 subscription_key → AI Service 向官方後端驗證配額
→ 使用官方 API Key 調用 AI → 記錄用量 → 定期結算
```

---

### Rust Backend：Loco-rs

```
backend/
├── src/
│   ├── main.rs
│   ├── routes/
│   │   ├── auth.rs         # 登入/註冊
│   │   ├── cards.rs        # 卡片 CRUD
│   │   ├── review.rs       # 複習記錄
│   │   └── sync.rs         # 跨設備同步
│   └── models/
│       ├── user.rs
│       ├── card.rs
│       ├── deck.rs
│       └── review_log.rs
└── Cargo.toml
```

**API 設計：**

| Method | Path | 說明 |
|--------|------|------|
| POST | `/auth/sign-up` | 用戶註冊 |
| POST | `/auth/sign-in` | 用戶登入 |
| GET | `/decks` | 獲取所有卡組 |
| POST | `/decks` | 創建卡組 |
| GET | `/cards?deck_id=` | 獲取卡片 |
| POST | `/cards` | 創建卡片 |
| PATCH | `/cards/{id}` | 更新卡片 |
| POST | `/review/log` | 提交複習結果 |
| GET | `/review/due` | 獲取今日待複習卡片 |
| GET | `/sync` | 拉取遠程變更 |
| POST | `/sync` | 上傳本地變更（delta sync）|

---

## 4. 數據模型

### 瀏覽器（IndexedDB Schema）

```typescript
// Dexie.js Schema
const db = new Dexie("OpenLearnDB");
db.version(1).stores({
  decks: "++id, name, createdAt",
  cards: "++id, deckId, front, back, hint, *tags, sourceId, fsrsState, dueDate, intervalSecs, easeFactor",
  reviewLogs: "++id, cardId, rating, reviewedAt, elapsedSecs",
  sources: "++id, type, url, title, createdAt, content",
  settings: "key",  // AI mode, API key, etc.
});
```

### 雲端（PostgreSQL Schema）

```sql
-- Decks
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  hint TEXT,
  tags TEXT[] DEFAULT '{}',
  source_id UUID REFERENCES sources(id),
  fsrs_state JSONB DEFAULT '{}',
  due_date TIMESTAMPTZ,
  interval_secs BIGINT DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Logs
CREATE TABLE review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 4),
  elapsed_secs BIGINT,
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  interval_secs BIGINT,
  ease_factor REAL
);

-- Sources
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'youtube', 'web', 'text')),
  url TEXT,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (官方訂閱)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'team')),
  subscription_key TEXT UNIQUE NOT NULL,
  quota_used BIGINT DEFAULT 0,
  quota_limit BIGINT DEFAULT 100,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_cards_due_date ON cards(due_date);
CREATE INDEX idx_review_logs_card_id ON review_logs(card_id);
CREATE INDEX idx_sources_user_id ON sources(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

---

## 5. 開發階段

### Phase 1：瀏覽器單機模式（MVP）
- [ ] 項目初始化：monorepo 結構（pnpm workspaces）
- [ ] Next.js 前端 + Tailwind + shadcn/ui
- [ ] IndexedDB 封裝（Dexie.js）+ 基本 CRUD
- [ ] fsrs.js 前端調度
- [ ] 複習界面（翻轉卡片）
- [ ] API Key 設定 UI（BYOK / 官方訂閱切換）

### Phase 2：AI 卡片生成
- [ ] AI Service：FastAPI + instructor
- [ ] PDF 上傳 + 文本提取
- [ ] AI 卡片生成（支持多 Provider：OpenAI / Anthropic / Ollama / Groq）
- [ ] YouTube 攝入 + Whisper
- [ ] 官方訂閱配額系統

### Phase 3：雲端同步
- [ ] Rust Backend：用戶認證（JWT）
- [ ] PostgreSQL Schema + 遷移
- [ ] 跨設備同步（delta sync）
- [ ] 離線衝突解決策略

### Phase 4：完整功能
- [ ] 網頁抓取（Firecrawl/Playwright）
- [ ] RAG 對話（向量嵌入 + ChromaDB）
- [ ] 多格式輸出（思維導圖 / 練習題）

---

## 6. 命名與品牌

**項目名：** `OpenLearn`（拉丁文「心靈」+ 卡片）

**口號：** "From source to mastery, open forever."

**Color Palette：**
- Primary: `#6366F1`（Indigo）
- Secondary: `#F59E0B`（Amber）
- Background: `#0F172A`（Slate 900）
- Surface: `#1E293B`（Slate 800）
- Text: `#F8FAFC`（Slate 50）

**許可證：** MIT License

---

## 7. 開源參考項目

| 項目 | Stars | 用途 |
|------|-------|------|
| `open-spaced-repetition/fsrs4anki` | 3881★ | FSRS 算法理論基礎 |
| `open-spaced-repetition/fsrs.js` | 178★ | JS FSRS 前端實現 |
| `umodoc/editor` | 1432★ | Tiptap 文檔編輯器 |
| `zeus-12/uxie` | 185★ | PDF + flashcard 生成 |
| `loco-rs/loco` | 8812★ | Rust Web 框架 |
| `casibase/casibase` | 4494★ | AI 知識庫完整實現 |
| `567-labs/instructor` | — | Python 結構化輸出 |

---

*最後更新：2025-04-11*
