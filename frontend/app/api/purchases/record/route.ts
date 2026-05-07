import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// ── Constants ──────────────────────────────────────────────────────────────

// Solana base58 public key: 32 bytes → 43–44 chars
const SOL_WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
// Solana transaction signature: 64 bytes → ~87–88 base58 chars
const TX_SIG_RE     = /^[1-9A-HJ-NP-Za-km-z]{44,100}$/;

const VALID_NETWORKS = new Set(["devnet", "testnet", "mainnet-beta"]);

// ── Helpers ────────────────────────────────────────────────────────────────

function json(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

// ── DB row shapes ──────────────────────────────────────────────────────────

interface GameRow {
  local_game_id:    string;
  title:            string;
  pricing:          string;
  price_sol:        number | null;
  download_url:     string | null;
  developer_wallet: string | null;
  is_published:     boolean;
}

// ── Request body shape ─────────────────────────────────────────────────────

interface RecordBody {
  local_game_id:         string;
  buyer_username?:       string;
  buyer_wallet:          string;
  transaction_signature: string;
  network?:              string;
  access_type?:          string;
  // seller_wallet, game_title, price_paid_sol, download_url are
  // intentionally ignored from the client — we use DB values instead.
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: RecordBody;
  try {
    body = await request.json() as RecordBody;
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  // ── Required fields ─────────────────────────────────────────────────────
  const gameId = typeof body.local_game_id         === "string" ? body.local_game_id.trim()         : "";
  const wallet = typeof body.buyer_wallet           === "string" ? body.buyer_wallet.trim()           : "";
  const sig    = typeof body.transaction_signature  === "string" ? body.transaction_signature.trim()  : "";

  if (!gameId) return json({ error: "local_game_id is required." }, 400);
  if (!wallet) return json({ error: "buyer_wallet is required." }, 400);
  if (!sig)    return json({ error: "transaction_signature is required." }, 400);

  // ── Format validation ───────────────────────────────────────────────────
  if (!SOL_WALLET_RE.test(wallet))
    return json({ error: "buyer_wallet must be a valid Solana public key (base58, 32–44 chars)." }, 400);
  if (!TX_SIG_RE.test(sig))
    return json({ error: "transaction_signature is not a valid Solana signature (base58, 44–100 chars)." }, 400);

  // ── network ────────────────────────────────────────────────────────────
  const rawNetwork = typeof body.network === "string" ? body.network.trim() : "devnet";
  const network = VALID_NETWORKS.has(rawNetwork) ? rawNetwork : "devnet";

  // ── Verify game exists and is published ────────────────────────────────
  const { data: gameData, error: gameErr } = await supabaseAdmin
    .from("games")
    .select("local_game_id, title, pricing, price_sol, download_url, developer_wallet, is_published")
    .eq("local_game_id", gameId)
    .maybeSingle();

  if (gameErr) {
    console.error("[purchases/record] Game lookup error:", gameErr.message);
    return json({ error: "Failed to verify game." }, 500);
  }
  if (!gameData) {
    return json({ error: "Game not found." }, 404);
  }

  const game = gameData as GameRow;

  if (!game.is_published) {
    return json({ error: "Cannot purchase an unpublished game." }, 400);
  }

  // ── Guard against duplicate transaction signatures ─────────────────────
  // Both this check and the DB unique constraint protect against replay.
  const { data: existing, error: dupErr } = await supabaseAdmin
    .from("purchases")
    .select("id")
    .eq("transaction_signature", sig)
    .maybeSingle();

  if (dupErr) {
    console.error("[purchases/record] Duplicate check error:", dupErr.message);
    return json({ error: "Failed to verify transaction uniqueness." }, 500);
  }
  if (existing) {
    return json({ error: "This transaction has already been recorded." }, 409);
  }

  // ── Authoritative price from DB, not from client ───────────────────────
  const canonicalPrice = game.pricing === "paid-sol" ? (game.price_sol ?? 0) : 0;

  // download_url comes from the game record; client value is ignored
  const downloadUrl = game.download_url ?? null;

  // ── Insert purchase ────────────────────────────────────────────────────
  const { data, error } = await supabaseAdmin
    .from("purchases")
    .insert({
      local_game_id:         gameId,
      game_title:            game.title,
      buyer_username:        typeof body.buyer_username === "string"
        ? body.buyer_username.trim().slice(0, 60) || null : null,
      buyer_wallet:          wallet,
      seller_wallet:         game.developer_wallet ?? null,
      price_paid_sol:        canonicalPrice,
      transaction_signature: sig,
      network,
      access_type:           typeof body.access_type === "string"
        ? body.access_type.trim().slice(0, 30) || "paid" : "paid",
      download_url:          downloadUrl,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[purchases/record] Supabase error:", error.message);
    // 23505 = unique_violation — duplicate sig slipped past the earlier check
    if (error.code === "23505") {
      return json({ error: "This transaction has already been recorded." }, 409);
    }
    return json({ error: "Failed to save purchase." }, 500);
  }

  const result = data as { id: string };
  return json({ ok: true, id: result.id });
}
