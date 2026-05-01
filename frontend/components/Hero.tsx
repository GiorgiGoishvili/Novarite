"use client";

import { motion } from "framer-motion";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

const ENGINE_TAGS = [
  "HTML5",
  "Godot",
  "Unity",
  "Unreal",
  "GameMaker",
  "WebGL",
  "ZIP / EXE",
  "Ren'Py",
];

const STATS = [
  { value: "0%",       label: "Listing fee" },
  { value: "Any engine", label: "Upload format" },
  { value: "Instant",   label: "Publishing" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      {/* Subtle dot grid background */}
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-100" aria-hidden="true" />

      {/* Faint red glow — very subtle accent */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-nr-red/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-5 text-center">

        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-nr-border bg-nr-surface px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-nr-red animate-pulse-red" />
          <span className="font-sans text-xs font-medium text-nr-muted">
            Open beta — free to publish
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="font-sans text-5xl font-extrabold leading-[1.1] tracking-tight text-nr-ink md:text-6xl lg:text-7xl"
        >
          A home for indie games
          <br />
          <span className="text-nr-red">and the devs building them.</span>
        </motion.h1>

        {/* Supporting copy */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease }}
          className="mx-auto mt-6 max-w-2xl font-sans text-lg leading-relaxed text-nr-muted"
        >
          Upload your game from any engine, share it with players, and build
          your community. No approval queue, no gatekeepers, no cut of your
          revenue.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.34, ease }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-nr-red px-7 py-3 font-sans text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-nr-redhover hover:shadow-md animate-pulse-red"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2v9M4.5 5.5L8 2l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.5 11.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Upload your game
          </a>
          <a
            href="#games"
            className="inline-flex items-center gap-2 rounded-lg border border-nr-border bg-white px-7 py-3 font-sans text-sm font-semibold text-nr-ink shadow-sm transition-all duration-150 hover:bg-nr-surface hover:border-nr-ring"
          >
            Browse games
          </a>
        </motion.div>

        {/* Engine tag strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.46, ease }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="font-sans text-xs text-nr-faint">Supports:</span>
          {ENGINE_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-nr-border bg-nr-surface px-3 py-0.5 font-mono text-xs text-nr-muted"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.58 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-2"
        >
          {STATS.map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && (
                <span className="h-4 w-px bg-nr-border" aria-hidden="true" />
              )}
              <div className="px-5 text-center">
                <div className="font-sans text-2xl font-extrabold text-nr-ink">
                  {value}
                </div>
                <div className="mt-0.5 font-sans text-xs text-nr-faint">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
