-- ============================================================
-- Migration 004: Game media columns + Supabase Storage setup
-- Additive only — no column drops, no breaking changes.
-- Safe to re-run (idempotent).
--
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ADD MEDIA COLUMNS TO games
--
-- NOTE: Migration 003 assumed cover_image_url already existed
-- but never created it. This migration adds it safely.
-- ────────────────────────────────────────────────────────────

ALTER TABLE games
  ADD COLUMN IF NOT EXISTS cover_image_url  text,
  ADD COLUMN IF NOT EXISTS screenshot_urls  text[] NOT NULL DEFAULT '{}';

-- ────────────────────────────────────────────────────────────
-- 2. STORAGE BUCKETS
--
-- Creates the two public storage buckets for game media.
-- Set public = true so the CDN URLs are accessible without auth.
-- file_size_limit: 4 MB per file (4 * 1024 * 1024 bytes).
-- allowed_mime_types: only web-safe image formats.
--
-- If you prefer the Dashboard instead of SQL, skip this section
-- and follow the manual steps in the project README.
-- ────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'game-covers',
    'game-covers',
    true,
    4194304,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  ),
  (
    'game-screenshots',
    'game-screenshots',
    true,
    4194304,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 3. STORAGE RLS POLICIES
--
-- Public read is required so the CDN URLs work in <img> tags.
-- Authenticated upload is required so only signed-in developers
-- can upload (the API route validates the session server-side
-- using the service role key, which bypasses RLS — these policies
-- protect direct client-side calls).
-- ────────────────────────────────────────────────────────────

-- Drop existing policies before recreating (idempotent)
DROP POLICY IF EXISTS "game-covers-public-read"        ON storage.objects;
DROP POLICY IF EXISTS "game-screenshots-public-read"   ON storage.objects;
DROP POLICY IF EXISTS "game-covers-auth-upload"        ON storage.objects;
DROP POLICY IF EXISTS "game-screenshots-auth-upload"   ON storage.objects;
DROP POLICY IF EXISTS "game-covers-owner-delete"       ON storage.objects;
DROP POLICY IF EXISTS "game-screenshots-owner-delete"  ON storage.objects;

-- Public read (unauthenticated browsers can load cover images)
CREATE POLICY "game-covers-public-read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'game-covers');

CREATE POLICY "game-screenshots-public-read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'game-screenshots');

-- Authenticated upload (extra guard — API already checks auth)
CREATE POLICY "game-covers-auth-upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'game-covers' AND auth.role() = 'authenticated');

CREATE POLICY "game-screenshots-auth-upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'game-screenshots' AND auth.role() = 'authenticated');

-- Owners can delete their own files
CREATE POLICY "game-covers-owner-delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'game-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "game-screenshots-owner-delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'game-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
