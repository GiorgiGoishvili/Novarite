"use client";

import { motion } from "framer-motion";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 text-center">

      {/* ── Dot-matrix background ── */}
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-100" aria-hidden="true" />

      {/* ── Atmospheric glow orbs ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 h-[600px] w-[600px] -translate-x-1/2 translate-y-1/3 rounded-full bg-nr-blood/20 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/4 top-0 h-[400px] w-[400px] translate-x-1/2 -translate-y-1/3 rounded-full bg-nr-brass/18 blur-[100px]"
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex max-w-3xl flex-col items-center">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-10 flex items-center gap-4"
        >
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-nr-gold/50" />
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-nr-gold/70">
            Powered by Solana · Colosseum 2024
          </span>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-nr-gold/50" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease }}
          className="font-display text-5xl font-bold leading-[1.08] tracking-wide text-nr-bone md:text-[4.5rem]"
        >
          For the Games
          <br />
          <span className="text-gold">That Deserve to Last.</span>
        </motion.h1>

        {/* Supporting copy */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease }}
          className="mt-7 max-w-xl font-sans text-lg leading-relaxed text-nr-dust"
        >
          Novarite is the on-chain platform for indie developers and players.
          Publish games, sell access passes as Solana PDAs, and reward your
          earliest supporters — without middlemen or approval queues.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38, ease }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <button className="animate-cta-glow rounded border border-nr-crimson bg-nr-crimson px-8 py-3 font-sans text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:border-nr-ember hover:bg-nr-ember">
            Explore Games
          </button>
          <button className="rounded border border-nr-edge bg-nr-abyss px-8 py-3 font-sans text-sm font-semibold tracking-wide text-nr-bone transition-all duration-300 hover:border-nr-seam hover:bg-nr-deep">
            Publish Your Game
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-2"
        >
          {[
            { value: "0%",       label: "Listing fee" },
            { value: "On-chain", label: "Access passes" },
            { value: "< 1s",     label: "Transaction time" },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && (
                <span className="h-3 w-px bg-nr-rim" aria-hidden="true" />
              )}
              <div className="px-4 text-center">
                <div className="font-display text-xl font-bold text-nr-shine">
                  {value}
                </div>
                <div className="mt-0.5 font-sans text-xs text-nr-smoke">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-nr-smoke">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="h-7 w-px bg-gradient-to-b from-nr-smoke to-transparent"
        />
      </div>
    </section>
  );
}
