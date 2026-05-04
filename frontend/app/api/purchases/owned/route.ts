import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = 'force-dynamic';

function json(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId")?.trim();
    const wallet = searchParams.get("wallet")?.trim();

    if (!gameId) return json({ error: "gameId is required." }, 400);
    if (!wallet) return json({ error: "wallet is required." }, 400);

    const { data, error } = await supabaseAdmin
      .from("purchases")
      .select(
        "id, local_game_id, game_title, buyer_wallet, transaction_signature, " +
        "price_paid_sol, network, access_type, download_url, created_at"
      )
      .eq("local_game_id", gameId)
      .eq("buyer_wallet", wallet)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[purchases/owned] Supabase error:", error.message);
      return json({ error: "Failed to check ownership." }, 500);
    }

    if (!data) return json({ owned: false });

    const row = data as unknown as {
      id:                    string;
      local_game_id:         string;
      game_title:            string | null;
      buyer_wallet:          string;
      transaction_signature: string | null;
      price_paid_sol:        number | null;
      network:               string | null;
      access_type:           string | null;
      download_url:          string | null;
      created_at:            string;
    };

    return json({
      owned: true,
      purchase: {
        id:                   row.id,
        gameId:               row.local_game_id,
        gameTitle:            row.game_title,
        buyerWallet:          row.buyer_wallet,
        transactionSignature: row.transaction_signature,
        priceSol:             row.price_paid_sol,
        network:              row.network,
        accessType:           row.access_type,
        downloadUrl:          row.download_url,
        purchasedAt:          row.created_at,
      },
    });
  } catch (err) {
    console.error("[purchases/owned] Unexpected:", err instanceof Error ? err.message : err);
    return json({ error: "Internal server error." }, 500);
  }
}
