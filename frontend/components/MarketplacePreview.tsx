"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { mockGames, type MockGame } from "@/lib/mockGames";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { fetchAllGames } from "@/lib/novariteClient";

const GENRES = ["All", "Dark RPG", "Tactical FPS", "Adventure", "Strategy", "Puzzle", "Survival Horror"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.21, 0.47, 0.32, 0.98] } },
};

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded bg-nr-abyss animate-pulse">
      <div className="h-44 w-full bg-nr-deep" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-4 w-3/4 rounded bg-nr-deep" />
        <div className="h-3 w-1/2 rounded bg-nr-deep" />
        <div className="h-16 rounded bg-nr-deep" />
        <div className="h-8 rounded bg-nr-deep" />
      </div>
    </div>
  );
}

function GameCard({ game }: { game: MockGame }) {
  const [purchased, setPurchased] = useState(false);

  return (
    <motion.div
      variants={item}
      className="card-border group flex flex-col overflow-hidden rounded bg-nr-abyss transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover art */}
      <div
        className="relative h-44 w-full overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${game.coverFrom} 0%, ${game.coverTo} 100%)`,
        }}
      >
        {/* Large atmospheric symbol */}
        <span
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none font-sans text-[6rem] leading-none opacity-10 transition-opacity duration-500 group-hover:opacity-15"
          aria-hidden="true"
        >
          {game.coverSymbol}
        </span>

        {/* Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          {game.badge ? (
            <span className="rounded border border-white/15 bg-black/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/80 backdrop-blur-sm">
              {game.badge}
            </span>
          ) : (
            <span />
          )}
          <span className="rounded border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/60 backdrop-blur-sm">
            {game.genre}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-base font-semibold leading-snug tracking-wide text-nr-bone">
            {game.title}
          </h3>
          <p className="mt-0.5 font-mono text-[11px] tracking-wider text-nr-smoke">
            {game.studio}
          </p>
        </div>

        <p className="flex-1 font-sans text-sm leading-relaxed text-nr-dust">
          {game.description}
        </p>

        <div className="flex items-center gap-4 font-mono text-xs text-nr-smoke">
          <span className="text-nr-gold/70">★ {game.rating}</span>
          <span>{game.players.toLocaleString()} players</span>
        </div>

        <button
          onClick={() => setPurchased(true)}
          disabled={purchased}
          className={`mt-1 w-full rounded border py-2 font-sans text-sm font-semibold tracking-wide transition-all duration-300 ${
            purchased
              ? "cursor-default border-nr-gold/30 text-nr-gold"
              : game.price === 0
              ? "border-transparent bg-nr-deep text-nr-bone hover:bg-nr-pit hover:border-nr-edge"
              : "border-nr-crimson/60 bg-nr-crimson/10 text-nr-bone hover:bg-nr-crimson hover:border-nr-crimson hover:text-white"
          }`}
        >
          {purchased
            ? "✓  Access Pass Owned"
            : game.price === 0
            ? "Claim Free Access"
            : `${game.price} SOL — Get Access`}
        </button>
      </div>
    </motion.div>
  );
}

export default function MarketplacePreview() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [games, setGames] = useState<MockGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();

  useEffect(() => {
    const programIdEnv = process.env.NEXT_PUBLIC_PROGRAM_ID;
    if (!programIdEnv) {
      setGames(mockGames);
      setLoading(false);
      return;
    }
    const programId = new PublicKey(programIdEnv);

    fetchAllGames(connection, programId)
      .then((fetched) => {
        setGames(fetched.length > 0 ? fetched : mockGames);
      })
      .catch(() => {
        setGames(mockGames);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [connection]);

  const displayed =
    activeGenre === "All"
      ? games
      : games.filter((g) => g.genre === activeGenre);

  return (
    <section className="bg-nr-void py-28">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-nr-gold/70">
              The Vault
            </p>
            <h2 className="font-display text-4xl font-bold tracking-wide text-nr-bone">
              Browse & Own
            </h2>
            <p className="mt-2 font-sans text-nr-dust">
              Buy on-chain access passes and own your place in each game's world.
            </p>
          </div>
          <span className="font-mono text-xs text-nr-smoke">
            {games.length} games · localnet preview
          </span>
        </motion.div>

        {/* Genre filter */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`rounded border px-3 py-1 font-sans text-xs font-medium tracking-wide transition-all duration-200 ${
                activeGenre === g
                  ? "border-nr-gold/50 bg-nr-brass/20 text-nr-shine"
                  : "border-nr-rim text-nr-smoke hover:border-nr-edge hover:text-nr-dust"
              }`}
            >
              {g}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {displayed.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
