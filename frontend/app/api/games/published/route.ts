import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { GameListing } from "@/lib/games";

export const dynamic = "force-dynamic";

function json(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

interface GamesRow {
  local_game_id:      string;
  title:              string;
  short_desc:         string | null;
  description:        string | null;
  engine:             string | null;
  genre:              string | null;
  tags:               string[] | null;
  game_status:        string | null;
  build_types:        string[] | null;
  platform:           string | null;
  download_url:       string | null;
  file_size_label:    string | null;
  game_version:       string | null;
  pricing:            string | null;
  price_sol:          number | null;
  developer_wallet:   string | null;
  developer_username: string | null;
  external_play_url:  string | null;
  trailer_url:        string | null;
  is_published:       boolean;
  created_at:         string;
}

function rowToGameListing(row: GamesRow): GameListing {
  return {
    id:               row.local_game_id,
    title:            row.title,
    shortDesc:        row.short_desc         ?? "",
    fullDesc:         row.description        ?? "",
    engine:           row.engine             ?? "",
    genre:            row.genre              ?? "",
    tags:             row.tags               ?? [],
    gameStatus:       (row.game_status       ?? "released") as GameListing["gameStatus"],
    buildTypes:       row.build_types        ?? [],
    platform:         row.platform           ?? "",
    downloadUrl:      row.download_url       ?? "",
    fileSizeLabel:    row.file_size_label    ?? "",
    version:          row.game_version       ?? "",
    pricing:          (row.pricing           ?? "free") as "free" | "paid-sol",
    priceSol:         row.price_sol          ?? 0,
    developerWallet:  row.developer_wallet   ?? "",
    developerUsername: row.developer_username ?? "",
    externalPlayUrl:  row.external_play_url  ?? "",
    trailerUrl:       row.trailer_url        ?? "",
    visibility:       row.is_published ? "published" : "draft",
    createdAt:        row.created_at,
  };
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("games")
      .select(
        "local_game_id, title, short_desc, description, engine, genre, tags, " +
        "game_status, build_types, platform, download_url, file_size_label, " +
        "game_version, pricing, price_sol, developer_wallet, developer_username, " +
        "external_play_url, trailer_url, is_published, created_at"
      )
      .eq("is_published", true)
      .not("local_game_id", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[games/published] Supabase error:", error.message);
      return json({ error: "Failed to fetch games." }, 500);
    }

    const games = (data as unknown as GamesRow[]).map(rowToGameListing);
    return json({ games });
  } catch (err) {
    console.error("[games/published] Unexpected:", err instanceof Error ? err.message : err);
    return json({ error: "Internal server error." }, 500);
  }
}
