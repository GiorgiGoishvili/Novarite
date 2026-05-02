"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { fetchAllGames } from "@/lib/novariteClient";
import { getPublishedGames, type GameListing } from "@/lib/games";
import { seedDemoGamesIfNeeded } from "@/lib/seedGames";
import { savePurchase, getPurchaseForGame, type Purchase } from "@/lib/purchases";
import { useAuth } from "./AuthProvider";

// ─── animation variants ────────────────────────────────────────────────────────

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.21, 0.47, 0.32, 0.98] } },
};

// ─── types ────────────────────────────────────────────────────────────────────

interface BrowsableGame {
  id: string;
  title: string;
  developer: string;
  developerWallet: string;   // Solana public key for payment; empty = not available
  engine: string;
  genre: string;
  tags: string[];
  shortDesc: string;
  pricing: "free" | "paid-sol";
  priceSol: number;
  externalPlayUrl: string;
  platform: string;          // "Windows" | "macOS" | "Linux" | "Web / HTML5" | ""
  downloadUrl: string;       // Direct download URL; empty = no download available
  fileSizeLabel: string;     // e.g. "45 MB"
  version: string;           // e.g. "1.0"
  coverColor: string;
  coverEmoji: string;
  source: "local" | "onchain";
}

// ─── cover art generators (deterministic from id) ─────────────────────────────

const COVER_COLORS = ["#6366F1", "#DC2626", "#059669", "#D97706", "#7C3AED", "#2563EB", "#DB2777"];
const COVER_EMOJIS = ["🎮", "🕹️", "🎯", "⚔️", "🚀", "🎲", "🏆", "🌟", "🐉", "🌈", "🦊", "🧩"];

function coverColor(id: string): string {
  const h = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return COVER_COLORS[h % COVER_COLORS.length];
}
function coverEmoji(id: string): string {
  const h = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return COVER_EMOJIS[(h * 3) % COVER_EMOJIS.length];
}

// ─── converters ───────────────────────────────────────────────────────────────

function localToBrowsable(g: GameListing): BrowsableGame {
  return {
    id:              g.id,
    title:           g.title,
    developer:       g.developerUsername,
    developerWallet: g.developerWallet,
    engine:          g.engine || "Unknown",
    genre:           g.genre  || "Other",
    tags:            g.tags,
    shortDesc:       g.shortDesc,
    pricing:         g.pricing,
    priceSol:        g.priceSol,
    externalPlayUrl: g.externalPlayUrl,
    platform:        g.platform        ?? "",
    downloadUrl:     g.downloadUrl     ?? "",
    fileSizeLabel:   g.fileSizeLabel   ?? "",
    version:         g.version         ?? "",
    coverColor:      coverColor(g.id),
    coverEmoji:      coverEmoji(g.id),
    source:          "local",
  };
}

// ─── skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-nr-border bg-white animate-pulse">
      <div className="h-44 w-full bg-nr-panel" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-4 w-3/4 rounded bg-nr-panel" />
        <div className="h-3 w-1/2 rounded bg-nr-panel" />
        <div className="h-12 rounded bg-nr-panel" />
        <div className="h-9 rounded bg-nr-panel" />
      </div>
    </div>
  );
}

// ─── BuyButton ────────────────────────────────────────────────────────────────

const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";

function explorerTxUrl(sig: string): string {
  const cluster = SOLANA_NETWORK === "mainnet-beta" ? "" : `?cluster=${SOLANA_NETWORK}`;
  return `https://explorer.solana.com/tx/${sig}${cluster}`;
}

// ─── platform badge styles ────────────────────────────────────────────────────

const PLATFORM_STYLE: Record<string, string> = {
  "Windows":        "bg-blue-100 text-blue-700",
  "macOS":          "bg-gray-100 text-gray-700",
  "Linux":          "bg-orange-100 text-orange-700",
  "Web / HTML5":    "bg-green-100 text-green-700",
  "Android":        "bg-emerald-100 text-emerald-700",
  "Cross-platform": "bg-purple-100 text-purple-700",
};

// ─── DownloadButton ────────────────────────────────────────────────────────────

function DownloadButton({
  url,
  label = "Download",
  fileSizeLabel,
}: {
  url: string;
  label?: string;
  fileSizeLabel?: string;
}) {
  if (!url) {
    return (
      <button
        disabled
        className="block w-full rounded-lg border border-nr-border bg-nr-surface py-2 text-center font-sans text-sm text-nr-faint cursor-not-allowed"
      >
        Download link coming soon
      </button>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-center gap-2 w-full rounded-lg border border-nr-border bg-white py-2 text-center font-sans text-sm font-semibold text-nr-ink transition-colors hover:bg-nr-surface"
    >
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
      {fileSizeLabel && (
        <span className="font-sans text-xs font-normal text-nr-faint">{fileSizeLabel}</span>
      )}
    </a>
  );
}

function BuyButton({ game, userId }: { game: BrowsableGame; userId: string | null }) {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [step, setStep]       = useState<"idle" | "buying" | "error">("idle");
  const [error, setError]     = useState("");
  const [purchase, setPurchase] = useState<Purchase | null>(null);

  // Load ownership from localStorage client-side (avoids SSR hydration mismatch)
  useEffect(() => {
    if (userId) setPurchase(getPurchaseForGame(userId, game.id));
  }, [userId, game.id]);

  const owned = !!purchase;

  async function handleFreeAccess() {
    if (!userId) { setError("Sign in to get access."); return; }
    const p = savePurchase({
      gameId:               game.id,
      gameTitle:            game.title,
      buyerUserId:          userId,
      buyerWallet:          publicKey?.toBase58() ?? "",
      sellerWallet:         game.developerWallet,
      priceSol:             0,
      transactionSignature: "",
      network:              SOLANA_NETWORK,
      accessType:           "free",
      downloadUrl:          game.downloadUrl,
    });
    setPurchase(p);
  }

  async function handleBuy() {
    if (!userId)             { setError("Sign in to buy games."); return; }
    if (!connected || !publicKey) { setError("Connect your Solana wallet first."); return; }
    if (!game.developerWallet)    { setError("Payout wallet not configured for this game."); return; }

    setStep("buying");
    setError("");

    try {
      const recipient = new PublicKey(game.developerWallet);
      const lamports  = Math.round(game.priceSol * LAMPORTS_PER_SOL);

      if (lamports <= 0) throw new Error("Invalid price.");

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction();
      tx.recentBlockhash = blockhash;
      tx.feePayer        = publicKey;
      tx.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: recipient, lamports }));

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");

      const p = savePurchase({
        gameId:               game.id,
        gameTitle:            game.title,
        buyerUserId:          userId,
        buyerWallet:          publicKey.toBase58(),
        sellerWallet:         game.developerWallet,
        priceSol:             game.priceSol,
        transactionSignature: sig,
        network:              SOLANA_NETWORK,
        accessType:           "paid",
        downloadUrl:          game.downloadUrl,
      });
      setPurchase(p);
      setStep("idle");
    } catch (e) {
      setStep("error");
      const msg = (e as Error)?.message ?? "";
      if (msg.includes("User rejected") || msg.includes("rejected the request") || msg.includes("Transaction cancelled")) {
        setError("Payment cancelled.");
      } else if (msg.includes("Invalid price")) {
        setError("Invalid price configured for this game.");
      } else {
        setError("Transaction failed. Check your wallet balance and try again.");
      }
    }
  }

  // Already owned — show download button (or owned badge if no download)
  if (owned) {
    return (
      <div className="flex flex-col gap-1.5">
        {game.downloadUrl || purchase?.downloadUrl ? (
          <DownloadButton
            url={game.downloadUrl || purchase?.downloadUrl || ""}
            label="Download"
            fileSizeLabel={game.fileSizeLabel}
          />
        ) : (
          <span className="block w-full rounded-lg border border-green-200 bg-green-50 py-2 text-center font-sans text-sm font-semibold text-green-700">
            ✓ Owned
          </span>
        )}
        {purchase?.transactionSignature && (
          <a
            href={explorerTxUrl(purchase.transactionSignature)}
            target="_blank"
            rel="noreferrer"
            className="text-center font-sans text-xs text-nr-indigo hover:underline"
          >
            View transaction →
          </a>
        )}
      </div>
    );
  }

  // Free game — show download directly (no sign-in needed if no URL; else prompt)
  if (game.pricing === "free") {
    if (game.downloadUrl) {
      return (
        <DownloadButton
          url={game.downloadUrl}
          label="Download free"
          fileSizeLabel={game.fileSizeLabel}
        />
      );
    }
    if (game.externalPlayUrl) {
      return (
        <a
          href={game.externalPlayUrl}
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-lg bg-nr-red py-2 text-center font-sans text-sm font-semibold text-white transition-colors hover:bg-nr-redhover"
        >
          Play in browser
        </a>
      );
    }
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => void handleFreeAccess()}
          className="block w-full rounded-lg border border-nr-border bg-nr-surface py-2 text-center font-sans text-sm font-semibold text-nr-ink transition-colors hover:bg-nr-panel"
        >
          Get free access
        </button>
        {error && <p className="font-sans text-xs text-nr-red">{error}</p>}
      </div>
    );
  }

  // Paid — no payout wallet configured
  if (!game.developerWallet) {
    return (
      <button
        disabled
        className="block w-full rounded-lg border border-nr-border bg-nr-surface py-2 text-center font-sans text-sm text-nr-faint cursor-not-allowed"
      >
        {game.priceSol > 0 ? `${game.priceSol} SOL` : "Purchase unavailable"}
      </button>
    );
  }

  // Paid — normal buy button
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => void handleBuy()}
        disabled={step === "buying"}
        className="block w-full rounded-lg bg-nr-red py-2 text-center font-sans text-sm font-semibold text-white transition-colors hover:bg-nr-redhover disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {step === "buying" ? "Processing…" : `Buy — ${game.priceSol} SOL`}
      </button>
      {error && (
        <div className="flex flex-col gap-0.5">
          <p className="font-sans text-xs text-nr-red">{error}</p>
          {step === "error" && (
            <button
              onClick={() => { setStep("idle"); setError(""); }}
              className="self-start font-sans text-xs text-nr-muted hover:text-nr-ink transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GameCard ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  prototype:    "Prototype",
  demo:         "Demo",
  "early-access": "Early Access",
  released:     "Released",
};

const STATUS_STYLE: Record<string, string> = {
  prototype:    "bg-amber-100 text-amber-700",
  demo:         "bg-blue-100 text-blue-700",
  "early-access": "bg-purple-100 text-purple-700",
  released:     "bg-green-100 text-green-700",
};

function GameCard({ game, userId }: { game: BrowsableGame; userId: string | null }) {
  return (
    <motion.div
      variants={item}
      className="card-hover flex flex-col overflow-hidden rounded-xl border border-nr-border bg-white shadow-card"
    >
      {/* Cover */}
      <div
        className="relative h-44 w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${game.coverColor}33 0%, ${game.coverColor}99 100%)`,
        }}
      >
        <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-white/70 px-2 py-0.5 font-mono text-[10px] font-medium text-nr-body backdrop-blur-sm">
          {game.engine}
        </span>

        {/* Platform badge */}
        {game.platform && (
          <span className={`absolute left-3 bottom-3 rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold ${PLATFORM_STYLE[game.platform] ?? "bg-gray-100 text-gray-700"}`}>
            {game.platform}
          </span>
        )}

        {game.pricing !== "free" && game.priceSol > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-nr-ink/80 px-2 py-0.5 font-sans text-[10px] font-semibold text-white backdrop-blur-sm">
            {game.priceSol} SOL
          </span>
        )}

        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-7xl opacity-30"
          aria-hidden="true"
        >
          {game.coverEmoji}
        </span>

        {game.externalPlayUrl && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 font-sans text-[10px] font-medium text-nr-body backdrop-blur-sm">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1" />
              <ellipse cx="5" cy="5" rx="2" ry="4.5" stroke="currentColor" strokeWidth="0.75" />
              <path d="M0.5 5h9" stroke="currentColor" strokeWidth="0.75" />
            </svg>
            Plays in browser
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-sans text-base font-semibold leading-snug text-nr-ink">
              {game.title}
            </h3>
            {game.source === "local" && STATUS_LABEL[game.coverEmoji] && (
              <span className={`shrink-0 rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold ${STATUS_STYLE["released"]}`}>
                New
              </span>
            )}
          </div>
          <p className="mt-0.5 font-sans text-xs text-nr-muted">
            by {game.developer}
            {game.version && (
              <span className="ml-1.5 text-nr-faint">v{game.version}</span>
            )}
          </p>
        </div>

        {game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {game.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border border-nr-border bg-nr-surface px-2 py-0.5 font-sans text-[10px] text-nr-muted">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="flex-1 font-sans text-sm leading-relaxed text-nr-body line-clamp-3">
          {game.shortDesc}
        </p>

        <div className="mt-auto">
          <BuyButton game={game} userId={userId} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── MarketplacePreview ───────────────────────────────────────────────────────

export default function MarketplacePreview() {
  const [allGames,    setAllGames]    = useState<BrowsableGame[]>([]);
  const [activeGenre, setActiveGenre] = useState("All");
  const [loading,     setLoading]     = useState(true);
  const { connection } = useConnection();
  const { user } = useAuth();

  useEffect(() => {
    // 1. Seed demo game on first load if library is empty
    seedDemoGamesIfNeeded();

    // 2. Load local games immediately (no async)
    const localGames = getPublishedGames().map(localToBrowsable);
    setAllGames(localGames);

    // 2. If on-chain program ID is configured, merge on-chain games
    const programIdEnv = process.env.NEXT_PUBLIC_PROGRAM_ID;
    if (!programIdEnv) {
      setLoading(false);
      return;
    }

    try {
      const programId = new PublicKey(programIdEnv);
      fetchAllGames(connection, programId)
        .then((onChain) => {
          const converted = onChain.map((g) => ({
            id:              g.id,
            title:           g.title,
            developer:       g.developer,
            developerWallet: "", // on-chain account pubkey ≠ developer wallet; skip for MVP
            engine:          g.engine,
            genre:           g.genre,
            tags:            g.tags,
            shortDesc:       g.description,
            pricing:         (g.price > 0 ? "paid-sol" : "free") as "free" | "paid-sol",
            priceSol:        g.price,
            externalPlayUrl: "",
            platform:        "",
            downloadUrl:     "",
            fileSizeLabel:   "",
            version:         "",
            coverColor:      g.coverColor,
            coverEmoji:      g.coverEmoji,
            source:          "onchain" as const,
          }));
          setAllGames((prev) => {
            // Deduplicate by id in case a local game matches on-chain
            const ids = new Set(prev.map((g) => g.id));
            return [...prev, ...converted.filter((g) => !ids.has(g.id))];
          });
        })
        .catch(() => { /* on-chain fetch failed — local games still show */ })
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, [connection]);

  const availableGenres = useMemo(() => {
    if (allGames.length === 0) return [];
    const genreSet = new Set(allGames.map((g) => g.genre).filter(Boolean));
    return ["All", ...Array.from(genreSet)];
  }, [allGames]);

  const displayed = useMemo(
    () => (activeGenre === "All" ? allGames : allGames.filter((g) => g.genre === activeGenre)),
    [allGames, activeGenre]
  );

  const hasGames = allGames.length > 0;
  const userId   = user?.username ?? null;

  return (
    <section id="games" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-10"
        >
          <p className="mb-1.5 font-sans text-xs font-semibold uppercase tracking-widest text-nr-red">
            Discover games
          </p>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-nr-ink md:text-4xl">
            Browse indie games
          </h2>
          {hasGames && (
            <p className="mt-2 font-sans text-sm text-nr-muted">
              {allGames.length} game{allGames.length !== 1 ? "s" : ""} published by indie developers.
            </p>
          )}
        </motion.div>

        {/* Genre filter */}
        {hasGames && availableGenres.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mb-8 flex flex-wrap gap-2"
          >
            {availableGenres.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className={`rounded-full border px-4 py-1.5 font-sans text-sm font-medium transition-all duration-150 ${
                  activeGenre === g
                    ? "border-nr-red bg-nr-red text-white"
                    : "border-nr-border bg-white text-nr-muted hover:border-nr-ring hover:text-nr-ink"
                }`}
              >
                {g}
              </button>
            ))}
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : !hasGames ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-nr-ring bg-nr-surface px-8 py-20 text-center"
          >
            <span className="text-5xl" aria-hidden="true">🎮</span>
            <div>
              <h3 className="font-sans text-xl font-extrabold text-nr-ink">
                No games published yet.
              </h3>
              <p className="mx-auto mt-2 max-w-md font-sans text-sm leading-relaxed text-nr-muted">
                Novarite is ready for its first indie uploads. When developers publish
                games, they will appear here.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-nr-red px-6 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-nr-redhover"
              >
                Upload your game
              </a>
              <a
                href={user ? "/upload" : "/register"}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-nr-border bg-white px-6 py-2.5 font-sans text-sm font-semibold text-nr-ink transition-colors hover:bg-nr-surface"
              >
                {user ? "Go to upload" : "Join as developer"}
              </a>
            </div>
          </motion.div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-nr-border bg-nr-surface py-16 text-center">
            <span className="text-4xl">🔍</span>
            <p className="font-sans text-sm text-nr-muted">
              No games in this genre yet.{" "}
              <button
                onClick={() => setActiveGenre("All")}
                className="font-semibold text-nr-red hover:text-nr-redhover transition-colors"
              >
                Show all
              </button>
            </p>
          </div>
        ) : (
          <motion.div
            key={activeGenre}
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {displayed.map((game) => (
              <GameCard key={game.id} game={game} userId={userId} />
            ))}
          </motion.div>
        )}

      </div>
    </section>
  );
}
