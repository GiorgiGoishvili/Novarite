"use client";

import { motion } from "framer-motion";

const EMPTY_STATS = [
  { label: "Games published", value: "0", icon: "🎮" },
  { label: "Drafts",          value: "0", icon: "📝" },
  { label: "Total downloads", value: "0", icon: "⬇️" },
  { label: "Total plays",     value: "0", icon: "▶️" },
];

const DASHBOARD_FEATURES = [
  { icon: "📄", text: "Create and edit your game page with a title, description, and cover" },
  { icon: "📦", text: "Upload browser-playable or downloadable builds (HTML5, WebGL, ZIP, EXE)" },
  { icon: "🖼️", text: "Add cover images, screenshots, and a trailer link" },
  { icon: "🔧", text: "Set engine, build type, tags, genre, and game status" },
  { icon: "👁️", text: "Control visibility: keep it a Draft or go Published" },
  { icon: "📊", text: "Track plays, downloads, and player activity (once games are live)" },
  { icon: "🔑", text: "Optional Solana supporter passes — coming later for developers who want on-chain rewards" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.46, ease: [0.21, 0.47, 0.32, 0.98] } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export default function CreatorDashboardPreview() {
  return (
    <section id="dashboard" className="bg-nr-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-12"
        >
          <p className="mb-1.5 font-sans text-xs font-semibold uppercase tracking-widest text-nr-red">
            Dev dashboard
          </p>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-nr-ink md:text-4xl">
            Your developer dashboard
          </h2>
          <p className="mt-2 font-sans text-base text-nr-muted max-w-xl">
            Manage your uploaded games, builds, screenshots, descriptions, and publishing
            settings from one place.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

          {/* Left: stats + empty state */}
          <div className="flex flex-col gap-6">

            {/* Stats — honest zeros */}
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {EMPTY_STATS.map((s) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  className="rounded-xl border border-nr-border bg-white p-5 shadow-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-sans text-xs font-medium uppercase tracking-wide text-nr-faint">
                      {s.label}
                    </p>
                    <span className="text-lg" aria-hidden="true">{s.icon}</span>
                  </div>
                  <p className="font-sans text-3xl font-extrabold text-nr-ink">{s.value}</p>
                  <p className="mt-1.5 font-sans text-xs text-nr-faint">No games uploaded yet</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty game state */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.46, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-nr-ring bg-white px-8 py-16 text-center shadow-card"
            >
              <span className="text-5xl" aria-hidden="true">🎮</span>
              <div>
                <h3 className="font-sans text-xl font-bold text-nr-ink">
                  You have not uploaded any games yet.
                </h3>
                <p className="mx-auto mt-2 max-w-sm font-sans text-sm leading-relaxed text-nr-muted">
                  Upload your first game to create a public game page on Novarite. Add your
                  build, cover image, screenshots, and description — then decide when to go live.
                </p>
              </div>
              <a
                href="/upload"
                className="inline-flex items-center gap-2 rounded-lg bg-nr-red px-7 py-3 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nr-redhover"
              >
                Upload your first game
              </a>
            </motion.div>
          </div>

          {/* Right: feature checklist */}
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.48, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="flex flex-col gap-4 h-fit"
          >
            <div className="rounded-xl border border-nr-border bg-white p-6 shadow-card">
              <h3 className="font-sans text-sm font-semibold text-nr-ink mb-4">
                What you can manage
              </h3>
              <ul className="flex flex-col gap-3">
                {DASHBOARD_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-start gap-3">
                    <span className="shrink-0 text-base leading-none mt-0.5" aria-hidden="true">
                      {f.icon}
                    </span>
                    <span className="font-sans text-sm leading-snug text-nr-body">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Web3 note — honest, secondary */}
            <div className="rounded-xl border border-nr-indigoborder bg-nr-indigobg p-5">
              <p className="font-sans text-xs font-semibold text-nr-indigo mb-1.5">
                Optional · Web3 features
              </p>
              <p className="font-sans text-xs text-nr-body leading-relaxed">
                Optional supporter passes can be added later for developers who want
                on-chain supporter rewards. The platform works entirely without Web3.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Upload CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-nr-border bg-white px-8 py-10 text-center shadow-card md:flex-row md:text-left"
        >
          <div className="flex-1">
            <h3 className="font-sans text-xl font-extrabold text-nr-ink">
              Ready to publish your first game?
            </h3>
            <p className="mt-1.5 font-sans text-sm text-nr-muted">
              Fill in a few details, upload your build, and decide when to go live. No approval
              process, no gatekeepers.
            </p>
          </div>
          <a
            href="/upload"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-nr-red px-7 py-3 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nr-redhover"
          >
            Upload your first game
          </a>
        </motion.div>

      </div>
    </section>
  );
}
