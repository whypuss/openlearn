-- ============================================================
-- OpenLearn — Supabase Schema Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Decks ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own decks"
  ON decks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Cards ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cards (
  id BIGSERIAL PRIMARY KEY,
  deck_id BIGINT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  hint TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  source_id BIGINT DEFAULT 0,

  -- FSRS state (JSON string)
  fsrs_state JSONB DEFAULT '{}',

  -- SM-2 scheduling
  due_date TIMESTAMPTZ DEFAULT now(),
  interval_secs INTEGER DEFAULT 0,
  ease_factor NUMERIC(4,2) DEFAULT 2.50,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cards"
  ON cards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for due cards query
CREATE INDEX IF NOT EXISTS cards_due ON cards (user_id, due_date)
  WHERE due_date <= now();

-- ── Review Logs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_logs (
  id BIGSERIAL PRIMARY KEY,
  card_id BIGINT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 4),
  interval_secs INTEGER NOT NULL,
  ease_factor NUMERIC(4,2) NOT NULL,
  duration_ms INTEGER DEFAULT 0,

  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own review logs"
  ON review_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decks_updated_at
  BEFORE UPDATE ON decks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Profiles (extends auth.users) ────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
