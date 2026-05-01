import { SITE_LINKS } from "@/lib/siteLinks";

const SOCIAL_LINKS = [
  { label: "GitHub", href: SITE_LINKS.github },
  { label: "X (Twitter)", href: SITE_LINKS.x },
  { label: "LinkedIn", href: SITE_LINKS.linkedin },
  { label: "Discord", href: SITE_LINKS.discord },
].filter((s) => s.href !== "");

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-nr-surface">
      <div className="mx-auto max-w-2xl px-5 py-16">

        <div className="mb-10">
          <p className="mb-1.5 font-sans text-xs font-semibold uppercase tracking-widest text-nr-red">
            About
          </p>
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-nr-ink">
            What is Novarite?
          </h1>
        </div>

        <div className="flex flex-col gap-8 font-sans text-base leading-relaxed text-nr-body">

          <section className="rounded-xl border border-nr-border bg-white p-7 shadow-card">
            <h2 className="mb-3 font-sans text-lg font-bold text-nr-ink">The platform</h2>
            <p>
              Novarite is an indie game hosting platform — a place where independent developers can
              upload, share, and sell their games without gatekeepers, approval processes, or
              arbitrary fees.
            </p>
            <p className="mt-3">
              Upload HTML5 games, Godot builds, Unity WebGL exports, downloadable ZIPs, or
              executables. Set your own price (or make it free). Decide when to go public. Your
              game page, your call.
            </p>
          </section>

          <section className="rounded-xl border border-nr-border bg-white p-7 shadow-card">
            <h2 className="mb-3 font-sans text-lg font-bold text-nr-ink">The creator</h2>
            <p>
              Novarite was created by{" "}
              <a
                href={SITE_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-nr-ink underline underline-offset-2 hover:text-nr-red transition-colors"
              >
                Giorgi Goishvili
              </a>{" "}
              as an independent project. It is built with Next.js, Tailwind CSS, and Solana —
              though the Web3 layer is entirely optional and the platform is designed to work
              fully without it.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {SITE_LINKS.github && (
                <a
                  href={SITE_LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-nr-border bg-nr-surface px-3 py-1.5 font-sans text-sm text-nr-muted transition-colors hover:border-nr-ring hover:text-nr-ink"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  View on GitHub
                </a>
              )}
              {SITE_LINKS.linkedin && (
                <a
                  href={SITE_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-nr-border bg-nr-surface px-3 py-1.5 font-sans text-sm text-nr-muted transition-colors hover:border-nr-ring hover:text-nr-ink"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-nr-border bg-white p-7 shadow-card">
            <h2 className="mb-3 font-sans text-lg font-bold text-nr-ink">Web3 — optional, not required</h2>
            <p>
              Novarite supports optional on-chain features: developers can issue supporter passes as
              Solana tokens if they want to offer holders exclusive rewards. This is a feature you
              can enable, not a requirement. Players without wallets get the full experience.
            </p>
          </section>

          <section className="rounded-xl border border-nr-border bg-white p-7 shadow-card">
            <h2 className="mb-3 font-sans text-lg font-bold text-nr-ink">Status</h2>
            <p>
              Novarite is currently in early development. Game uploads, developer accounts, and the
              marketplace are being built. No games are live yet — if you are reading this, you are
              one of the first people here.
            </p>
            <p className="mt-3">
              Want to be an early developer? Create an account and upload when you are ready. The
              first games on the platform will get front-page visibility from day one.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href="/upload"
                className="inline-flex items-center justify-center rounded-lg bg-nr-red px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-nr-redhover"
              >
                Upload your game
              </a>
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-lg border border-nr-border bg-white px-5 py-2.5 font-sans text-sm font-semibold text-nr-ink transition-colors hover:bg-nr-surface"
              >
                Create an account
              </a>
            </div>
          </section>

          {SOCIAL_LINKS.length > 0 && (
            <section className="rounded-xl border border-nr-border bg-white p-7 shadow-card">
              <h2 className="mb-3 font-sans text-lg font-bold text-nr-ink">Find us</h2>
              <ul className="flex flex-col gap-2">
                {SOCIAL_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-sm text-nr-red hover:text-nr-redhover transition-colors"
                    >
                      {label} →
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </div>
    </main>
  );
}
