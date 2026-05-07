-- Migration 002: profiles table, RLS policies, and updated_at trigger
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste & run

-- ────────────────────────────────────────────────────────────────────────────
-- 1. CREATE PROFILES TABLE
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id               uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username         text        UNIQUE NOT NULL,
  display_name     text,
  bio              text,
  location         text,
  studio_name      text,
  -- avatar_url: for Phase 3 image upload (not yet used by the UI)
  avatar_url       text,
  -- avatar_color: hex color used by the current color-based avatar UI
  avatar_color     text        NOT NULL DEFAULT '#DC2626',
  -- role: developer role / title (e.g. "Programmer", "Artist")
  role             text,
  -- email: contact email — may differ from the Supabase Auth login email
  email            text,
  github_url       text,
  linkedin_url     text,
  x_url            text,
  website_url      text,
  phone            text,
  email_verified   boolean     NOT NULL DEFAULT false,
  phone_verified   boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. CONSTRAINTS
-- ────────────────────────────────────────────────────────────────────────────

-- Username format: 3–30 chars, letters/digits/underscore/hyphen only
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_username_format
    CHECK (
      length(username) >= 3
      AND length(username) <= 30
      AND username ~ '^[a-zA-Z0-9_-]+$'
    );

-- avatar_color must be a CSS hex color
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_avatar_color_format;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_avatar_color_format
    CHECK (avatar_color ~ '^#[0-9A-Fa-f]{6}$');

-- ────────────────────────────────────────────────────────────────────────────
-- 3. AUTO-UPDATE updated_at
-- ────────────────────────────────────────────────────────────────────────────

-- Reuse the set_updated_at() function created in migration 001.
-- If running this migration independently, create it first:
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated) can read all profiles.
-- Required for: username uniqueness checks during registration, public
-- developer profiles, and AuthProvider fetching a username after sign-in.
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

-- A user can only insert their own profile row.
-- auth.uid() = id ensures the row's id matches the authenticated user.
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- A user can only update their own profile row.
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
             WITH CHECK (auth.uid() = id);

-- No DELETE policy: profiles are retained when the user is active.
-- The ON DELETE CASCADE on the FK handles removal if the auth user is deleted.

-- ────────────────────────────────────────────────────────────────────────────
-- 5. INDEX
-- ────────────────────────────────────────────────────────────────────────────

-- Username lookups are frequent (login, profile pages, publish authz)
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
