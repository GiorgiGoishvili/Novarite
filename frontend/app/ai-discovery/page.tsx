"use client";

import { useState, FormEvent } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { localRecommend, type Recommendation } from "@/lib/localDiscover";

const EXAMPLES = [
  "cozy relaxing game with crafting",
  "dark difficult platformer with exploration and combat",
  "short scary horror game",
  "turn-based pixel RPG with story",
  "fast space shooter with high scores",
];

interface QVACResponse {
  mode: string;
  recommendations: Recommendation[];
}

export default function AIDiscoveryPage() {
  const [query, setQuery]   = useState("");
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [mode, setMode]     = useState<"qvac" | "local" | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setResults(null);

    // Try local QVAC API server first (only available when running locally)
    const apiUrl = process.env.NEXT_PUBLIC_QVAC_API_URL;
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        if (res.ok) {
          const data = (await res.json()) as QVACResponse;
          setResults(data.recommendations);
          setMode("qvac");
          setLoading(false);
          return;
        }
      } catch {
        // QVAC server not running — fall through to local matching
      }
    }

    // Browser-side fallback: lightweight word + tag overlap matching
    setResults(localRecommend(q));
    setMode("local");
    setLoading(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-nr-surface">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="bg-white border-b border-nr-border px-5 py-14">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-nr-indigoborder bg-nr-indigobg px-3 py-1 font-sans text-xs font-semibold text-nr-indigo mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-nr-indigo animate-pulse" />
              Powered by QVAC local AI
            </div>
            <h1 className="font-sans text-4xl font-extrabold tracking-tight text-nr-ink">
              AI Game Discovery
            </h1>
            <p className="mt-3 font-sans text-base text-nr-muted max-w-lg mx-auto">
              Describe what you want to play. Novarite recommends matching indie
              games — no exact keywords needed.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-5 py-10 flex flex-col gap-8">

          {/* ── Search form ─────────────────────────────────────────────── */}
          <div className="rounded-xl border border-nr-border bg-white p-6 shadow-card">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted">
                What do you want to play?
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                placeholder="I want a cozy relaxing game with crafting and a good story…"
                className="w-full rounded-lg border border-nr-border bg-white px-4 py-3 font-sans text-sm text-nr-ink placeholder-nr-placeholder outline-none transition-colors focus:border-nr-red focus:ring-2 focus:ring-nr-red/10 resize-none"
              />

              <div>
                <p className="mb-2 font-sans text-[11px] text-nr-faint uppercase tracking-wide">
                  Try an example
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => { setQuery(ex); runSearch(ex); }}
                      className="rounded-full border border-nr-border px-3 py-1 font-sans text-xs text-nr-muted hover:border-nr-ring hover:text-nr-body hover:bg-nr-panel transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="self-start rounded-lg bg-nr-red px-6 py-2.5 font-sans text-sm font-semibold text-white hover:bg-nr-redhover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Searching…" : "Find games"}
              </button>
            </form>
          </div>

          {/* ── Results ─────────────────────────────────────────────────── */}
          {results && (
            <div className="flex flex-col gap-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-lg font-bold text-nr-ink">
                  Top {results.length} matches
                </h2>
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-sans text-xs font-semibold ${
                    mode === "qvac"
                      ? "border-nr-indigoborder bg-nr-indigobg text-nr-indigo"
                      : "border-nr-border bg-nr-panel text-nr-muted"
                  }`}
                >
                  {mode === "qvac" ? "QVAC embeddings" : "Local matching"}
                </span>
              </div>

              {results.map((rec, i) => (
                <div
                  key={rec.id}
                  className="rounded-xl border border-nr-border bg-white p-5 shadow-card transition-shadow hover:shadow-card-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-sans text-base font-bold text-nr-ink truncate">
                        {rec.title}
                      </h3>
                      <span className="mt-1 inline-block rounded-full bg-nr-panel px-2 py-0.5 font-sans text-[11px] font-medium text-nr-muted">
                        {rec.genre}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-sans text-xl font-extrabold text-nr-red leading-none">
                        {mode === "qvac"
                          ? `${Math.round(rec.score * 100)}%`
                          : `#${i + 1}`}
                      </div>
                      <div className="mt-0.5 font-sans text-[10px] text-nr-faint">
                        {mode === "qvac" ? "match" : "rank"}
                      </div>
                    </div>
                  </div>

                  <p className="mt-2.5 font-sans text-xs font-semibold text-nr-indigo">
                    {rec.reason}
                  </p>
                  <p className="mt-1.5 font-sans text-sm text-nr-body leading-relaxed">
                    {rec.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {rec.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-nr-border bg-nr-surface px-2 py-0.5 font-sans text-[11px] text-nr-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── QVAC engine info ────────────────────────────────────────── */}
          <div className="rounded-xl border border-nr-indigoborder bg-nr-indigobg p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 rounded-full bg-nr-indigo/10 p-1.5">
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  className="text-nr-indigo"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-sans text-sm font-bold text-nr-indigo">
                  QVAC Local AI Engine
                </h3>
                <p className="mt-1.5 font-sans text-xs text-nr-body leading-relaxed">
                  Novarite&apos;s discovery engine uses{" "}
                  <strong>QVAC embeddings</strong> (GTE-Large FP16) to match
                  natural language queries against indie game metadata entirely
                  on-device. Your search preferences never leave your machine —
                  no cloud AI API, no tracking, no rate limits.
                </p>
                <p className="mt-2 font-sans text-xs text-nr-muted leading-relaxed">
                  The hosted web page uses lightweight browser-side matching as
                  a demo. Run the local QVAC CLI or start the API server for
                  full semantic embeddings:
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <code className="block rounded-lg border border-nr-indigoborder bg-white px-3 py-2 font-mono text-xs text-nr-ink overflow-x-auto">
                    node qvac/game-discovery.mjs &quot;cozy relaxing game with crafting&quot;
                  </code>
                  <code className="block rounded-lg border border-nr-indigoborder bg-white px-3 py-2 font-mono text-xs text-nr-ink overflow-x-auto">
                    node qvac/server.mjs
                    <span className="text-nr-muted ml-2">
                      # then set NEXT_PUBLIC_QVAC_API_URL=http://localhost:4000
                    </span>
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tether QVAC side-track note ─────────────────────────────── */}
          <div className="rounded-xl border border-nr-border bg-white p-6 shadow-card">
            <h3 className="font-sans text-sm font-bold text-nr-ink">
              About this integration
            </h3>
            <p className="mt-2 font-sans text-xs text-nr-muted leading-relaxed">
              Novarite integrates the <strong>QVAC SDK</strong> as its core game
              discovery engine. QVAC embeddings run locally and on-device to
              match player intent against indie game metadata using cosine
              similarity over GTE-Large FP16 vector representations. This
              directly addresses one of Novarite&apos;s central product problems:
              small indie games are hard to find, and players often do not know
              exact tags or genres. QVAC allows natural-language discovery while
              preserving user privacy — no search query is ever sent to a
              centralized AI service.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-center">
              {[
                { label: "On-device", desc: "Model runs locally via QVAC runtime" },
                { label: "Private",   desc: "Zero queries sent to cloud APIs" },
                { label: "Offline",   desc: "Works with no internet after first run" },
              ].map(({ label, desc }) => (
                <div
                  key={label}
                  className="rounded-lg border border-nr-border bg-nr-surface px-3 py-3"
                >
                  <div className="font-sans text-sm font-bold text-nr-ink">{label}</div>
                  <div className="mt-0.5 font-sans text-[11px] text-nr-muted">{desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
