-- ============================================================
-- Migration 003: Core Platform Additions
-- Additive only — no column drops, no breaking changes.
-- Safe to re-run (idempotent).
--
-- NOTE: This migration assumes:
--   games.developer_id    already exists (FK → profiles.id)
--   purchases.buyer_id    already exists (FK → profiles.id)
--   purchases.game_id     already exists (FK → games.id)
--   games.cover_image_url already exists
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ADD COLUMNS TO games
-- ────────────────────────────────────────────────────────────

ALTER TABLE games
  ADD COLUMN IF NOT EXISTS slug                 text,
  ADD COLUMN IF NOT EXISTS published_at         timestamptz,
  ADD COLUMN IF NOT EXISTS content_rating       text         NOT NULL DEFAULT 'everyone',
  ADD COLUMN IF NOT EXISTS has_mature_content   boolean      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS content_warnings     text[]       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS minimum_price_sol    numeric      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suggested_price_sol  numeric,
  ADD COLUMN IF NOT EXISTS views_count          integer      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downloads_count      integer      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchases_count      integer      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wishlist_count       integer      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_avg           numeric(3,2),
  ADD COLUMN IF NOT EXISTS review_count         integer      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured          boolean      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_until       timestamptz;

-- ────────────────────────────────────────────────────────────
-- 2. ADD COLUMNS TO purchases
--    buyer_id and game_id already exist — only add refund cols
-- ────────────────────────────────────────────────────────────

ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS refund_status  text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS refunded_at    timestamptz,
  ADD COLUMN IF NOT EXISTS refund_reason  text;

-- ────────────────────────────────────────────────────────────
-- 3. ADD COLUMNS TO profiles
-- ────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_developer     boolean  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_banned        boolean  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen_at     timestamptz,
  ADD COLUMN IF NOT EXISTS games_count      integer  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews    integer  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS follower_count   integer  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count  integer  NOT NULL DEFAULT 0;

-- ────────────────────────────────────────────────────────────
-- 4. BACKFILLS
-- ────────────────────────────────────────────────────────────

-- 4a. games.developer_id  ← match developer_username → profiles.username
--     (fills any rows where developer_id is still null)
UPDATE games g
SET    developer_id = p.id
FROM   profiles p
WHERE  g.developer_username = p.username
  AND  g.developer_id IS NULL;

-- 4b. purchases.buyer_id  ← match buyer_username → profiles.username
--     (fills any rows where buyer_id is still null)
UPDATE purchases pu
SET    buyer_id = p.id
FROM   profiles p
WHERE  pu.buyer_username = p.username
  AND  pu.buyer_id IS NULL;

-- 4c. purchases.game_id  ← match local_game_id → games.local_game_id
--     (fills any rows where game_id is still null)
UPDATE purchases pu
SET    game_id = g.id
FROM   games g
WHERE  pu.local_game_id = g.local_game_id
  AND  pu.game_id IS NULL;

-- 4d. games.published_at  ← created_at for already-published games
UPDATE games
SET    published_at = created_at
WHERE  is_published = true
  AND  published_at IS NULL;

-- ────────────────────────────────────────────────────────────
-- 5. CONSTRAINTS
-- ────────────────────────────────────────────────────────────

-- games: non-negative counters
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_views_count_nonneg;
ALTER TABLE games ADD CONSTRAINT games_views_count_nonneg
  CHECK (views_count >= 0);

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_downloads_count_nonneg;
ALTER TABLE games ADD CONSTRAINT games_downloads_count_nonneg
  CHECK (downloads_count >= 0);

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_purchases_count_nonneg;
ALTER TABLE games ADD CONSTRAINT games_purchases_count_nonneg
  CHECK (purchases_count >= 0);

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_wishlist_count_nonneg;
ALTER TABLE games ADD CONSTRAINT games_wishlist_count_nonneg
  CHECK (wishlist_count >= 0);

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_review_count_nonneg;
ALTER TABLE games ADD CONSTRAINT games_review_count_nonneg
  CHECK (review_count >= 0);

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_minimum_price_sol_nonneg;
ALTER TABLE games ADD CONSTRAINT games_minimum_price_sol_nonneg
  CHECK (minimum_price_sol >= 0);

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_suggested_price_sol_nonneg;
ALTER TABLE games ADD CONSTRAINT games_suggested_price_sol_nonneg
  CHECK (suggested_price_sol IS NULL OR suggested_price_sol >= 0);

ALTER TABLE games DROP CONSTRAINT IF EXISTS games_rating_avg_range;
ALTER TABLE games ADD CONSTRAINT games_rating_avg_range
  CHECK (rating_avg IS NULL OR (rating_avg >= 0 AND rating_avg <= 5));

-- games: content_rating enum
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_content_rating_check;
ALTER TABLE games ADD CONSTRAINT games_content_rating_check
  CHECK (content_rating IN ('everyone', 'teen', 'mature'));

-- purchases: refund_status enum
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_refund_status_check;
ALTER TABLE purchases ADD CONSTRAINT purchases_refund_status_check
  CHECK (refund_status IN ('none', 'requested', 'approved', 'denied'));

-- profiles: non-negative counters
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_games_count_nonneg;
ALTER TABLE profiles ADD CONSTRAINT profiles_games_count_nonneg
  CHECK (games_count >= 0);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_total_reviews_nonneg;
ALTER TABLE profiles ADD CONSTRAINT profiles_total_reviews_nonneg
  CHECK (total_reviews >= 0);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_follower_count_nonneg;
ALTER TABLE profiles ADD CONSTRAINT profiles_follower_count_nonneg
  CHECK (follower_count >= 0);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_following_count_nonneg;
ALTER TABLE profiles ADD CONSTRAINT profiles_following_count_nonneg
  CHECK (following_count >= 0);

-- ────────────────────────────────────────────────────────────
-- 6. INDEXES
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS games_developer_id_idx
  ON games (developer_id)
  WHERE developer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS games_slug_idx
  ON games (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS games_published_idx
  ON games (published_at DESC)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS games_featured_idx
  ON games (featured_until DESC)
  WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS games_rating_idx
  ON games (rating_avg DESC NULLS LAST)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS purchases_buyer_id_idx
  ON purchases (buyer_id)
  WHERE buyer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS purchases_game_id_idx
  ON purchases (game_id)
  WHERE game_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_is_developer_idx
  ON profiles (is_developer)
  WHERE is_developer = true;

-- ────────────────────────────────────────────────────────────
-- 7. TRIGGERS
-- ────────────────────────────────────────────────────────────

-- 7a. set_developer_flag
--     When a game is published (is_published flips to true),
--     mark the owning profile as a developer.

CREATE OR REPLACE FUNCTION set_developer_flag()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_published = true AND (OLD.is_published IS DISTINCT FROM true) THEN
    IF NEW.developer_id IS NOT NULL THEN
      UPDATE profiles
      SET    is_developer = true
      WHERE  id = NEW.developer_id
        AND  is_developer = false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_developer_flag ON games;
CREATE TRIGGER trg_set_developer_flag
  AFTER UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION set_developer_flag();

DROP TRIGGER IF EXISTS trg_set_developer_flag_insert ON games;
CREATE TRIGGER trg_set_developer_flag_insert
  AFTER INSERT ON games
  FOR EACH ROW
  WHEN (NEW.is_published = true AND NEW.developer_id IS NOT NULL)
  EXECUTE FUNCTION set_developer_flag();

-- 7b. set_game_published_at
--     Record the first moment a game is published.

CREATE OR REPLACE FUNCTION set_game_published_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_published = true
     AND (OLD.is_published IS DISTINCT FROM true)
     AND NEW.published_at IS NULL
  THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_game_published_at ON games;
CREATE TRIGGER trg_set_game_published_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION set_game_published_at();

DROP TRIGGER IF EXISTS trg_set_game_published_at_insert ON games;
CREATE TRIGGER trg_set_game_published_at_insert
  BEFORE INSERT ON games
  FOR EACH ROW
  WHEN (NEW.is_published = true AND NEW.published_at IS NULL)
  EXECUTE FUNCTION set_game_published_at();
