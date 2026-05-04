import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RecordBody {
  local_game_id:         string;
  game_title?:           string;
  buyer_username?:       string;
  buyer_wallet:          string;
  seller_wallet?:        string;
  price_paid_sol?:       number;
  transaction_signature: string;
  network?:              string;
  access_type?:          string;
  download_url?:         string;
}

function json(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RecordBody;
    const { local_game_id, buyer_wallet, transaction_signature } = body;

    if (!local_game_id?.trim())         return json({ error: "local_game_id is required." }, 400);
    if (!buyer_wallet?.trim())          return json({ error: "buyer_wallet is required." }, 400);
    if (!transaction_signature?.trim()) return json({ error: "transaction_signature is required." }, 400);

    const { data, error } = await supabaseAdmin
      .from("purchases")
      .insert({
        local_game_id:         local_game_id.trim(),
        game_title:            body.game_title      ?? null,
        buyer_username:        body.buyer_username  ?? null,
        buyer_wallet:          buyer_wallet.trim(),
        seller_wallet:         body.seller_wallet   ?? null,
        price_paid_sol:        body.price_paid_sol  ?? 0,
        transaction_signature: transaction_signature.trim(),
        network:               body.network         ?? "devnet",
        access_type:           body.access_type     ?? "paid",
        download_url:          body.download_url    ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[purchases/record] Supabase error:", error.message);
      return json({ error: "Failed to save purchase." }, 500);
    }

    const result = data as { id: string };
    return json({ ok: true, id: result.id });
  } catch (err) {
    console.error("[purchases/record] Unexpected:", err instanceof Error ? err.message : err);
    return json({ error: "Internal server error." }, 500);
  }
}
