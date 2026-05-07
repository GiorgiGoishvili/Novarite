-- Migration 001: Add constraints to games and purchases tables
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste & run

-- ────────────────────────────────────────────────────────────────────────────
-- 1. GAMES TABLE
-- ────────────────────────────────────────────────────────────────────────────

-- Timestamps (no-op if columns already exist)
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS created_at  timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at  timestamptz NOT NULL DEFAULT now();

-- NOT NULL on the two fields every game must have
ALTER TABLE games
  ALTER COLUMN title          SET NOT NULL,
  ALTER COLUMN local_game_id  SET NOT NULL;

-- Unique index on local_game_id (used as the upsert conflict target).
-- CREATE UNIQUE INDEX is safer than ADD CONSTRAINT when the table may already
-- have rows, because it supports CONCURRENTLY and gives a clearer error name.
CREATE UNIQUE INDEX IF NOT EXISTS games_local_game_id_key
  ON games (local_game_id);

-- Pricing must be one of the two known values
ALTER TABLE games
  DROP CONSTRAINT IF EXISTS games_pricing_check;
ALTER TABLE games
  ADD CONSTRAINT games_pricing_check
    CHECK (pricing IN ('free', 'paid-sol'));

-- Price must be non-negative
ALTER TABLE games
  DROP CONSTRAINT IF EXISTS games_price_sol_check;
ALTER TABLE games
  ADD CONSTRAINT games_price_sol_check
    CHECK (price_sol >= 0);

-- Paid games must have a non-empty developer wallet
ALTER TABLE games
  DROP CONSTRAINT IF EXISTS games_paid_wallet_required;
ALTER TABLE games
  ADD CONSTRAINT games_paid_wallet_required
    CHECK (
      pricing = 'free'
      OR (pricing = 'paid-sol' AND developer_wallet IS NOT NULL AND developer_wallet <> '')
    );

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS games_set_updated_at ON games;
CREATE TRIGGER games_set_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ────────────────────────────────────────────────────────────────────────────
-- 2. PURCHASES TABLE
-- ────────────────────────────────────────────────────────────────────────────

-- Timestamp (no-op if column already exists)
ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS created_at  timestamptz NOT NULL DEFAULT now();

-- NOT NULL on the three fields every purchase must have
ALTER TABLE purchases
  ALTER COLUMN local_game_id          SET NOT NULL,
  ALTER COLUMN buyer_wallet           SET NOT NULL,
  ALTER COLUMN transaction_signature  SET NOT NULL;

-- One transaction signature = one purchase record (prevents replay attacks)
CREATE UNIQUE INDEX IF NOT EXISTS purchases_transaction_signature_key
  ON purchases (transaction_signature);

-- Price must be non-negative
ALTER TABLE purchases
  DROP CONSTRAINT IF EXISTS purchases_price_paid_sol_check;
ALTER TABLE purchases
  ADD CONSTRAINT purchases_price_paid_sol_check
    CHECK (price_paid_sol >= 0);

-- Foreign key: every purchase must reference an existing game
-- NOTE: if existing purchase rows reference game IDs that no longer exist,
-- this will fail. Clean up orphan rows first with:
--   DELETE FROM purchases WHERE local_game_id NOT IN (SELECT local_game_id FROM games);
ALTER TABLE purchases
  DROP CONSTRAINT IF EXISTS purchases_local_game_id_fkey;
ALTER TABLE purchases
  ADD CONSTRAINT purchases_local_game_id_fkey
    FOREIGN KEY (local_game_id) REFERENCES games (local_game_id)
    ON DELETE RESTRICT;


-- ────────────────────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY (enable now; policies to be added in Phase 2)
-- ────────────────────────────────────────────────────────────────────────────
-- Currently all reads/writes go through the service role key which bypasses
-- RLS. Enabling RLS here has no runtime impact yet, but it means the moment
-- you switch any route to the anon key the tables are locked down by default.

ALTER TABLE games     ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Public read policy for published games (safe to expose to anon key)
DROP POLICY IF EXISTS "games_public_read" ON games;
CREATE POLICY "games_public_read" ON games
  FOR SELECT USING (is_published = true);

-- No other policies yet — all writes still go through service role.
-- Phase 2 will add authenticated INSERT/UPDATE policies once Supabase Auth
-- sessions are wired up.
