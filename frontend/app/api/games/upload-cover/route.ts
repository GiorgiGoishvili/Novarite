import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// ── Constants ──────────────────────────────────────────────────────────────

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// 4 MB — stays within Vercel's 4.5 MB serverless payload limit
const MAX_BYTES = 4 * 1024 * 1024;

const COVER_BUCKET      = "game-covers";
const SCREENSHOT_BUCKET = "game-screenshots";
const MAX_SCREENSHOTS   = 5;

// ── Helpers ────────────────────────────────────────────────────────────────

function json(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

function sanitiseFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

function fileExt(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "jpg") : "jpg";
}

// ── POST /api/games/upload-cover ───────────────────────────────────────────
//
// Accepts multipart/form-data with:
//   file  — the image File
//   type  — "cover" (default) or "screenshot"
//
// Returns { url: string } on success.

export async function POST(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const token = request
    .headers.get("Authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (!token) return json({ error: "Authentication required." }, 401);

  const {
    data: { user },
    error: authErr,
  } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) {
    return json({ error: "Invalid or expired session. Please sign in again." }, 401);
  }

  // ── Parse form data ───────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: "Could not parse form data." }, 400);
  }

  const uploadType = (formData.get("type") as string | null) ?? "cover";
  if (uploadType !== "cover" && uploadType !== "screenshot") {
    return json({ error: 'type must be "cover" or "screenshot".' }, 400);
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return json({ error: "No file provided." }, 400);
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!ALLOWED_MIME.has(file.type)) {
    return json({ error: "Only JPG, PNG, and WebP images are accepted." }, 400);
  }

  if (file.size > MAX_BYTES) {
    return json(
      { error: `Image must be ${MAX_BYTES / 1024 / 1024} MB or smaller.` },
      400
    );
  }

  // For screenshots, check the index hint (optional, just for informational purposes)
  const idxRaw = formData.get("index");
  const idx    = idxRaw !== null ? Number(idxRaw) : 0;
  if (uploadType === "screenshot" && idx >= MAX_SCREENSHOTS) {
    return json({ error: `Maximum ${MAX_SCREENSHOTS} screenshots allowed.` }, 400);
  }

  // ── Build storage path ────────────────────────────────────────────────────
  // Path: {user_id}/{timestamp}_{random}.{ext}
  // The user_id prefix is used by the owner-delete RLS policy.
  const bucket = uploadType === "screenshot" ? SCREENSHOT_BUCKET : COVER_BUCKET;
  const ext    = fileExt(sanitiseFilename(file.name));
  const rand   = Math.random().toString(36).slice(2, 8);
  const path   = `${user.id}/${Date.now()}_${rand}.${ext}`;

  // ── Upload to Supabase Storage ────────────────────────────────────────────
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert:      false,
    });

  if (uploadErr) {
    console.error("[upload-cover] Supabase Storage error:", uploadErr.message);
    return json({ error: "Upload failed. Please try again." }, 500);
  }

  // ── Return public URL ─────────────────────────────────────────────────────
  const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return json({ url: urlData.publicUrl });
}
