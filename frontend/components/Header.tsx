"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Ambient fade — no hard border, the background bleeds into the page */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-nr-void via-nr-void/80 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* ── Logo ── */}
        <a href="/" className="group flex items-center gap-3">
          {/* Diamond logo mark */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            className="transition-opacity group-hover:opacity-75"
          >
            <polygon
              points="11,1 21,8 21,14 11,21 1,14 1,8"
              stroke="#c09530"
              strokeWidth="1.2"
              fill="rgba(192,149,48,0.08)"
            />
            <polygon
              points="11,5 17,9 17,13 11,17 5,13 5,9"
              stroke="#c09530"
              strokeWidth="0.6"
              fill="rgba(192,149,48,0.05)"
            />
          </svg>
          <span className="font-display text-base font-semibold tracking-[0.18em] text-nr-bone uppercase">
            Novarite
          </span>
        </a>

        {/* ── Navigation ── */}
        <nav className="hidden items-center gap-8 md:flex">
          {["Games", "Developers", "Rewards", "Docs"].map((item) => (
            <a
              key={item}
              href="#"
              className="font-sans text-sm font-medium tracking-wide text-nr-dust transition-colors duration-200 hover:text-nr-bone"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* ── Wallet button ── */}
        <WalletMultiButton className="hidden md:flex" />
      </div>
    </header>
  );
}
