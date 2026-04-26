import { Connection, PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder, type Idl } from "@coral-xyz/anchor";
import type { MockGame } from "./mockGames";

// Minimal inline IDL — keep in sync with target/idl/novarite.json after anchor build.
const NOVARITE_IDL = {
  address: process.env.NEXT_PUBLIC_PROGRAM_ID ?? "",
  metadata: { name: "novarite", version: "0.1.0", spec: "0.1.0", description: "" },
  instructions: [],
  accounts: [
    // discriminator = sha256("account:game_listing")[0..8] — computed at runtime below
    { name: "GameListing", discriminator: [] as number[] },
  ],
  types: [
    {
      name: "GameListing",
      type: {
        kind: "struct" as const,
        fields: [
          { name: "developer", type: "pubkey" },
          { name: "gameSlug", type: "string" },
          { name: "title", type: "string" },
          { name: "metadataUri", type: "string" },
          { name: "priceLamports", type: "u64" },
          { name: "createdAt", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
  errors: [],
  events: [],
} satisfies Idl;

async function gameListingDiscriminator(): Promise<Uint8Array> {
  const msg = new TextEncoder().encode("account:game_listing");
  const hash = await globalThis.crypto.subtle.digest("SHA-256", msg.buffer.slice(msg.byteOffset, msg.byteOffset + msg.byteLength) as ArrayBuffer);
  return new Uint8Array(hash).slice(0, 8);
}

export async function fetchAllGames(
  connection: Connection,
  programId: PublicKey
): Promise<MockGame[]> {
  const discriminator = await gameListingDiscriminator();

  // Patch the discriminator into the IDL so BorshAccountsCoder can verify it.
  const idl = structuredClone(NOVARITE_IDL) as unknown as Idl;
  (idl as any).accounts[0].discriminator = Array.from(discriminator);

  const coder = new BorshAccountsCoder(idl);

  const accounts = await connection.getProgramAccounts(programId, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: Buffer.from(discriminator).toString("base64"),
          encoding: "base64",
        } as any,
      },
    ],
  });

  return accounts.map(({ pubkey, account }) => {
    const decoded = coder.decode("GameListing", account.data) as {
      developer: PublicKey;
      gameSlug: string;
      title: string;
      metadataUri: string;
      priceLamports: { toNumber(): number };
    };
    const dev = decoded.developer.toBase58();
    return {
      id: pubkey.toBase58(),
      slug: decoded.gameSlug,
      title: decoded.title,
      studio: `${dev.slice(0, 4)}…${dev.slice(-4)}`,
      genre: "Unknown",
      description: decoded.metadataUri,
      price: decoded.priceLamports.toNumber() / 1e9,
      players: 0,
      rating: 0,
      coverFrom: "#1a1a2e",
      coverTo: "#16213e",
      coverSymbol: "◆",
    };
  });
}
