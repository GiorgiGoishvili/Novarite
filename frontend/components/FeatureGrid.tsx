"use client";

import { motion } from "framer-motion";

const ENGINES = [
  {
    icon: "🌐",
    name: "HTML5 / Browser",
    description: "Runs instantly in any browser. Zero download required — share a link and players can start immediately.",
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    icon: "🔵",
    name: "Godot",
    description: "Export to HTML5, Windows, Mac, or Linux. Fully open source and indie-developer friendly.",
    color: "bg-indigo-50 border-indigo-100",
    iconBg: "bg-indigo-100",
  },
  {
    icon: "⚙️",
    name: "Unity",
    description: "Upload WebGL builds for browser play or package Windows, Mac, and Linux downloads.",
    color: "bg-gray-50 border-gray-200",
    iconBg: "bg-gray-100",
  },
  {
    icon: "🎮",
    name: "Unreal Engine",
    description: "Share high-fidelity experiences as packaged downloads. HTML5 export support for web builds.",
    color: "bg-slate-50 border-slate-100",
    iconBg: "bg-slate-100",
  },
  {
    icon: "👾",
    name: "GameMaker",
    description: "Perfect for 2D indie games and jam projects. Upload HTML5 exports for instant browser play.",
    color: "bg-green-50 border-green-100",
    iconBg: "bg-green-100",
  },
  {
    icon: "🟡",
    name: "Construct",
    description: "Export HTML5 directly and publish in minutes. Great for event-based 2D games.",
    color: "bg-yellow-50 border-yellow-100",
    iconBg: "bg-yellow-100",
  },
  {
    icon: "📖",
    name: "Ren'Py",
    description: "Visual novels and interactive stories. Package your project and let readers discover it.",
    color: "bg-pink-50 border-pink-100",
    iconBg: "bg-pink-100",
  },
  {
    icon: "📦",
    name: "ZIP / EXE / Any Engine",
    description: "Custom engine, proprietary tools, anything else — upload a ZIP or EXE and players can download it.",
    color: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-100",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.21, 0.47, 0.32, 0.98] } },
};

export default function FeatureGrid() {
  return (
    <section className="bg-nr-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-12 text-center"
        >
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest text-nr-red">
            Any engine. Any platform.
          </p>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-nr-ink md:text-4xl">
            Publish games built with your favourite tools
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-sans text-base text-nr-muted">
            Whether you export HTML5, package a ZIP, or ship a WebGL build — Novarite supports it. If
            it runs, you can share it.
          </p>
        </motion.div>

        {/* Engine grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ENGINES.map((engine) => (
            <motion.div
              key={engine.name}
              variants={item}
              className={`card-hover flex flex-col gap-3 rounded-xl border bg-white p-5 ${engine.color}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${engine.iconBg}`}>
                {engine.icon}
              </div>
              <div>
                <h3 className="font-sans text-sm font-semibold text-nr-ink">
                  {engine.name}
                </h3>
                <p className="mt-1 font-sans text-xs leading-relaxed text-nr-muted">
                  {engine.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-12 text-center"
        >
          <p className="font-sans text-sm text-nr-muted">
            Don&apos;t see your engine?{" "}
            <a href="#" className="font-semibold text-nr-red underline underline-offset-2 hover:text-nr-redhover transition-colors">
              Request support
            </a>{" "}
            or just upload a ZIP — it always works.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
