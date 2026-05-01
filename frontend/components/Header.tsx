"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-nr-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 h-14">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="11" stroke="#DC2626" strokeWidth="1.5" fill="none" />
            <polygon points="12,5 18,9.5 18,14.5 12,19 6,14.5 6,9.5" fill="#DC2626" opacity="0.12" />
            <polygon points="12,8 16,10.5 16,13.5 12,16 8,13.5 8,10.5" fill="#DC2626" opacity="0.9" />
          </svg>
          <span className="font-sans text-base font-bold tracking-tight text-nr-ink">Novarite</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <a
            href="/#games"
            className="rounded-md px-3 py-1.5 font-sans text-sm font-medium text-nr-muted transition-colors duration-150 hover:bg-nr-panel hover:text-nr-ink"
          >
            Browse
          </a>
          <a
            href="/upload"
            className="mx-1 rounded-md bg-nr-red px-3.5 py-1.5 font-sans text-sm font-semibold text-white transition-colors duration-150 hover:bg-nr-redhover"
          >
            Upload Game
          </a>
          {/* Dev Dashboard only appears once auth is confirmed */}
          {!isLoading && user && (
            <a
              href="/#dashboard"
              className="rounded-md px-3 py-1.5 font-sans text-sm font-medium text-nr-muted transition-colors duration-150 hover:bg-nr-panel hover:text-nr-ink"
            >
              Dev Dashboard
            </a>
          )}
        </nav>

        {/* Right: auth controls — hidden while auth state is loading to prevent flicker */}
        <div className="hidden md:flex items-center gap-2 min-w-[160px] justify-end">
          {isLoading ? (
            /* Invisible placeholder so layout doesn't shift */
            <span className="h-8 w-32 rounded-md bg-transparent" aria-hidden="true" />
          ) : user ? (
            <>
              <a
                href="/profile"
                className="rounded-md px-3 py-1.5 font-sans text-sm font-medium text-nr-muted transition-colors hover:bg-nr-panel hover:text-nr-ink"
              >
                {user.username}
              </a>
              <button
                onClick={logout}
                className="rounded-md border border-nr-border px-3 py-1.5 font-sans text-sm font-medium text-nr-muted transition-colors hover:bg-nr-panel hover:text-nr-ink"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="rounded-md px-3 py-1.5 font-sans text-sm font-medium text-nr-muted transition-colors hover:bg-nr-panel hover:text-nr-ink"
              >
                Sign in
              </a>
              <a
                href="/register"
                className="rounded-md border border-nr-border px-3 py-1.5 font-sans text-sm font-semibold text-nr-ink transition-colors hover:bg-nr-panel"
              >
                Create account
              </a>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden rounded-md p-2 text-nr-muted hover:bg-nr-panel hover:text-nr-ink"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {mobileOpen ? (
              <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            ) : (
              <path fillRule="evenodd" clipRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-nr-border bg-white px-5 py-4 flex flex-col gap-1">
          <a
            href="/#games"
            onClick={() => setMobileOpen(false)}
            className="rounded-md px-3 py-2 font-sans text-sm font-medium text-nr-body hover:bg-nr-panel"
          >
            Browse
          </a>
          <a
            href="/upload"
            onClick={() => setMobileOpen(false)}
            className="rounded-md px-3 py-2 font-sans text-sm font-medium bg-nr-red text-white hover:bg-nr-redhover"
          >
            Upload Game
          </a>
          {!isLoading && user && (
            <a
              href="/#dashboard"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 font-sans text-sm font-medium text-nr-body hover:bg-nr-panel"
            >
              Dev Dashboard
            </a>
          )}
          <div className="mt-3 flex flex-col gap-2 border-t border-nr-border pt-3">
            {isLoading ? null : user ? (
              <>
                <a
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 font-sans text-sm text-nr-body hover:bg-nr-panel"
                >
                  {user.username}
                </a>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="rounded-md border border-nr-border px-3 py-2 text-left font-sans text-sm text-nr-muted hover:bg-nr-panel"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <a href="/login" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 font-sans text-sm text-nr-body hover:bg-nr-panel">
                  Sign in
                </a>
                <a href="/register" onClick={() => setMobileOpen(false)} className="rounded-md border border-nr-border px-3 py-2 font-sans text-sm font-semibold text-nr-ink hover:bg-nr-panel">
                  Create account
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
