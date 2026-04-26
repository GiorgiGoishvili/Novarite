"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Total Revenue",      value: "12.4 SOL", delta: "+2.1 SOL",  up: true  },
  { label: "Access Passes Sold", value: "847",       delta: "+63 week",  up: true  },
  { label: "Active Players",     value: "634",       delta: "+12 today", up: true  },
  { label: "Rewards Claimed",    value: "1,203",     delta: "3 games",   up: null  },
];

const sales = [
  { wallet: "7xKp…3fQr", game: "Veilborn",              amount: "0.8 SOL",  ago: "2m"  },
  { wallet: "9mLn…8aBC", game: "Ironvault Protocol",    amount: "0.5 SOL",  ago: "7m"  },
  { wallet: "3qRt…1xYZ", game: "Veilborn",              amount: "0.8 SOL",  ago: "15m" },
  { wallet: "6pWs…4dEF", game: "Saltmarsh Chronicles",  amount: "0.35 SOL", ago: "31m" },
  { wallet: "2nHv…7gGH", game: "Carrion Faith",         amount: "0.6 SOL",  ago: "1h"  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.21, 0.47, 0.32, 0.98] } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export default function CreatorDashboardPreview() {
  return (
    <section className="bg-nr-abyss py-28">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-12"
        >
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-nr-gold/70">
            Creator Studio
          </p>
          <h2 className="font-display text-4xl font-bold tracking-wide text-nr-bone">
            Your Studio at a Glance
          </h2>
          <p className="mt-2 font-sans text-nr-dust">
            Live data pulled from on-chain — no estimates, no dashboards you can't trust.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="card-border rounded bg-nr-deep p-6"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-nr-smoke">
                {s.label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-nr-bone">
                {s.value}
              </p>
              <p
                className={`mt-1.5 font-sans text-xs ${
                  s.up === true
                    ? "text-emerald-400/80"
                    : s.up === false
                    ? "text-nr-ember"
                    : "text-nr-smoke"
                }`}
              >
                {s.up === true ? "↑ " : s.up === false ? "↓ " : ""}
                {s.delta}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent sales table */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.52, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="card-border overflow-hidden rounded bg-nr-deep"
        >
          <div className="flex items-center justify-between border-b border-nr-rim px-6 py-4">
            <h3 className="font-display text-sm font-semibold tracking-wide text-nr-bone">
              Recent Access Pass Sales
            </h3>
            <span className="font-mono text-xs text-nr-smoke">Live · localnet</span>
          </div>

          <div className="divide-y divide-nr-rim">
            {sales.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4 transition-colors duration-150 hover:bg-nr-pit"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar placeholder */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-nr-edge bg-nr-abyss font-mono text-xs text-nr-dust">
                    {s.wallet[0]}
                  </div>
                  <div>
                    <p className="font-mono text-sm text-nr-bone">{s.wallet}</p>
                    <p className="mt-0.5 font-sans text-xs text-nr-smoke">{s.game}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium text-nr-gold">{s.amount}</p>
                  <p className="mt-0.5 font-mono text-xs text-nr-smoke">{s.ago} ago</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Developer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.52, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-8 flex flex-col items-center gap-6 rounded border border-nr-gold/20 bg-nr-brass/5 px-8 py-10 text-center md:flex-row md:text-left"
        >
          <div className="flex-1">
            <h3 className="font-display text-xl font-semibold tracking-wide text-nr-bone">
              Ready to publish your game?
            </h3>
            <p className="mt-1.5 font-sans text-sm text-nr-dust">
              Register your studio on-chain in one transaction. No forms, no gatekeepers, no waiting.
            </p>
          </div>
          <button className="shrink-0 rounded border border-nr-gold/40 bg-nr-brass/15 px-7 py-3 font-sans text-sm font-semibold tracking-wide text-nr-shine transition-all duration-300 hover:border-nr-gold/60 hover:bg-nr-brass/25 hover:shadow-glow-gold">
            Register Studio
          </button>
        </motion.div>

      </div>
    </section>
  );
}
