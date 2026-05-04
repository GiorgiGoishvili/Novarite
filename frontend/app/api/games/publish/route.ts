import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface PublishBody {
  local_game_id:      string;
  title:              string;
  short_desc?:        string;
  description?:       string;
  engine?:            string;
  genre?:             string;
  tags?:              string[];
  game_status?:       string;
  build_types?:       string[];
  platform?:          string;
  download_url?:      string;
  file_size_label?:   string;
  game_version?:      string;
  pricing?:           string;
  price_sol?:         number;
  developer_wallet?:  string;
  developer_username?: string;
  external_play_url?: string;
  trailer_url?:       string;
  is_published?:      boolean;
  network?:           string;
}

function json(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PublishBody;
    const { local_game_id, title } = body;

    if (!local_game_id?.trim()) return json({ error: "local_game_id is required." }, 400);
    if (!title?.trim())         return json({ error: "title is required." }, 400);

    const row = {
      local_game_id:      local_game_id.trim(),
      title:              title.trim(),
      short_desc:         body.short_desc         ?? null,
      description:        body.description         ?? null,
      engine:             body.engine              ?? null,
      genre:              body.genre               ?? null,
      tags:               body.tags                ?? [],
      game_status:        body.game_status         ?? null,
      build_types:        body.build_types         ?? [],
      platform:           body.platform            ?? null,
      download_url:       body.download_url        ?? null,
      file_size_label:    body.file_size_label     ?? null,
      game_version:       body.game_version        ?? null,
      pricing:            body.pricing             ?? "free",
      price_sol:          body.price_sol           ?? 0,
      developer_wallet:   body.developer_wallet    ?? null,
      developer_username: body.developer_username  ?? null,
      external_play_url:  body.external_play_url   ?? null,
      trailer_url:        body.trailer_url         ?? null,
      is_published:       body.is_published        ?? true,
      network:            body.network             ?? "devnet",
      updated_at:         new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("games")
      .upsert(row, { onConflict: "local_game_id" })
      .select("id, local_game_id")
      .single();

    if (error) {
      console.error("[games/publish] Supabase error:", {
        message:     error.message,
        code:        error.code,
        details:     error.details,
        hint:        error.hint,
        payloadKeys: Object.keys(row),
      });
      return json({
        error:   "Failed to save game.",
        details: error.message,
        code:    error.code    ?? null,
        hint:    error.hint    ?? null,
      }, 500);
    }

    const result = data as { id: string; local_game_id: string };
    return json({ ok: true, id: result.id, local_game_id: result.local_game_id });
  } catch (err) {
    console.error("[games/publish] Unexpected:", err instanceof Error ? err.message : err);
    return json({ error: "Internal server error." }, 500);
  }
}
