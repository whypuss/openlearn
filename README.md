# OpenLearn

> From source to mastery, open forever.
> 完全開源的 AI 知識工作區 — 上傳文檔，生成卡片，達到精通

---

## 兩種運行模式

OpenLearn 支持兩種模式，共享同一套前端代碼：

### 模式 A：瀏覽器單機模式（無需後端）

所有資料存在瀏覽器 IndexedDB，完全免費、隱私最好、離線可用。

```bash
cd frontend
pnpm install
pnpm dev
# 打開 http://localhost:3000
```

AI 功能可選：接入本地 Ollama 或雲端 API。

### 模式 B：雲端三層模式（跨設備同步 + 完整 AI）

```
前端 (Next.js) → AI Service (FastAPI) → Rust Backend (Loco-rs)
```

```bash
# 前端
cd frontend && pnpm install && pnpm dev

# AI Service（另一終端）
cd ai-service && pip install -r requirements.txt && uvicorn main:app --port 8000

# Rust Backend（另一終端）
cd backend && cargo run
```

或使用 Docker 一鍵啟動：

```bash
docker compose up
```

---

## 核心功能

- [x] 多格式文檔攝入（PDF、YouTube、網頁、文本）
- [x] AI 自動生成間隔複習卡片（FSRS 演算法）
- [x] 瀏覽器單機模式（IndexedDB 存儲，無需後端）
- [ ] AI 對話式 QA（RAG，向量問答）
- [ ] 跨設備雲端同步
- [ ] 多人協作

---

## API Key 模式

OpenLearn 支持三種 AI接入方式：

### BYOK（自備 Key）
用自己的 OpenAI / Anthropic / Groq / Ollama API Key，完全自己管理，費用按官方定價。

### 官方訂閱
官方代付 API 費用，無需自己管理 Key，即開即用。

### 純離線
不使用 AI，僅用 FSRS 本地複習功能，完全免費。

---

## 技術棧

| 層 | 技術 | 說明 |
|----|------|------|
| 前端 | Next.js 15 + Tailwind CSS 4 + Tiptap 2 | 共享兩種模式 |
| 存儲（單機） | IndexedDB (Dexie.js) | 瀏覽器原生 |
| 存儲（雲端） | PostgreSQL + Loco-rs | Rust 後端 |
| AI Service | FastAPI + instructor + Ollama | 卡片生成、PDF 解析 |
| 算法 | FSRS (fsrs.js / fsrs-rs) | 世界排名第一間隔重複演算法 |

---

## 快速開始

### 前置需求

- Node.js 22+
- pnpm 9+
- Rust 1.85+（雲端模式）
- Python 3.12+（雲端模式）

### 單機模式

```bash
git clone https://github.com/YOUR_USERNAME/openlearn.git
cd openlearn/frontend
pnpm install
pnpm dev
```

### 雲端模式

```bash
git clone https://github.com/YOUR_USERNAME/openlearn.git
cd openlearn

# 啟動所有服務
docker compose up
```

---

## 環境變量

```bash
# AI Service（可選）
OPENAI_API_KEY=sk-...           # OpenAI API Key
OPENAI_BASE_URL=http://localhost:11434  # 本地 Ollama
OPENAI_MODEL=gpt-4o-mini

# Frontend
NEXT_PUBLIC_AI_URL=http://localhost:8000
```

---

## 許可證

MIT License — 鼓勵商業使用，無限制。
