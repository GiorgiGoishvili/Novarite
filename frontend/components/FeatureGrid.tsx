"use client";

import { motion } from "framer-motion";

const features = [
  {
    numeral: "I",
    title: "Publish Without Permission",
    description:
      "Register your studio on-chain and list any game in seconds. No approval process, no gatekeepers, no revenue share.",
  },
  {
    numeral: "II",
    title: "Access Passes as PDA Assets",
    description:
      "Every purchase creates an AccessPass PDA directly in the player's wallet. Verifiable, transferable, truly owned.",
  },
  {
    numeral: "III",
    title: "Reward Early Believers",
    description:
      "Issue on-chain rewards to your first supporters before launch. Turn early players into a community with real stakes.",
  },
  {
    numeral: "IV",
    title: "Transparent Creator Revenue",
    description:
      "Track every sale, pass, and reward claim from on-chain data. Your analytics — nothing hidden, nothing estimated.",
  },
  {
    numeral: "V",
    title: "Build on Open Ownership",
    description:
      "Access passes are composable primitives. Gate content, build perks, or let other developers build on top of them.",
  },
  {
    numeral: "VI",
    title: "Token Economies",
    description:
      "Full SPL token minting for in-game currencies, rare drops, and reward tokens. Launching in the next release.",
    soon: true,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
};

export default function FeatureGrid() {
  return (
    <section className="bg-nr-abyss py-28">
      <div className="mx-auto max-w-7xl px-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-16 max-w-xl"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-nr-gold/70">
            The Platform
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight tracking-wide text-nr-bone">
            Everything an Indie Game Needs to Launch and Grow
          </h2>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-px border border-nr-rim bg-nr-rim md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div
              key={f.numeral}
              variants={item}
              className="group relative bg-nr-abyss p-8 transition-colors duration-300 hover:bg-nr-deep"
            >
              {f.soon && (
                <span className="absolute right-5 top-5 rounded border border-nr-edge px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-nr-smoke">
                  Soon
                </span>
              )}
              {/* Roman numeral */}
              <div className="mb-5 font-display text-sm font-semibold tracking-widest text-nr-gold/60 transition-colors duration-300 group-hover:text-nr-gold/80">
                {f.numeral}
              </div>
              <h3 className="mb-3 font-display text-lg font-semibold leading-snug tracking-wide text-nr-bone">
                {f.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-nr-dust">
                {f.description}
              </p>
              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-8 right-8 h-px scale-x-0 bg-gradient-to-r from-nr-gold/0 via-nr-gold/40 to-nr-gold/0 transition-transform duration-500 group-hover:scale-x-100" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
