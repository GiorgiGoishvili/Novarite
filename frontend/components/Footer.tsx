export default function Footer() {
  return (
    <footer className="border-t border-nr-rim bg-nr-void py-14">
      <div className="mx-auto max-w-7xl px-6">

        {/* Main row */}
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:justify-between">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <polygon points="11,1 21,8 21,14 11,21 1,14 1,8" stroke="#c09530" strokeWidth="1.2" fill="rgba(192,149,48,0.08)" />
                <polygon points="11,5 17,9 17,13 11,17 5,13 5,9" stroke="#c09530" strokeWidth="0.6" fill="none" />
              </svg>
              <span className="font-display text-sm font-semibold tracking-[0.18em] text-nr-bone uppercase">
                Novarite
              </span>
            </div>
            <p className="mt-2 max-w-xs font-sans text-xs leading-relaxed text-nr-smoke">
              The on-chain platform for indie developers and the players who believe in them.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {["GitHub", "Docs", "Twitter", "Discord"].map((link) => (
              <a
                key={link}
                href="#"
                className="font-sans text-sm text-nr-smoke transition-colors duration-200 hover:text-nr-dust"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Hackathon badge */}
          <div className="rounded border border-nr-rim px-4 py-2 font-mono text-xs text-nr-smoke">
            Colosseum Hackathon 2024
          </div>
        </div>

        {/* Bottom rule */}
        <div className="rule-fade mt-10" />

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-center font-sans text-xs text-nr-smoke md:flex-row md:text-left">
          <p>© 2024 Novarite. MIT License.</p>
          <p>
            Built on{" "}
            <span className="text-nr-gold/70">Solana</span>
            {" · "}
            SPL Token rewards coming soon
          </p>
        </div>

      </div>
    </footer>
  );
}
