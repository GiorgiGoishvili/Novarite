"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-nr-surface px-5 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-2 mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="11" stroke="#DC2626" strokeWidth="1.5" fill="none" />
              <polygon points="12,8 16,10.5 16,13.5 12,16 8,13.5 8,10.5" fill="#DC2626" opacity="0.9" />
            </svg>
            <span className="font-sans text-lg font-bold text-nr-ink">Novarite</span>
          </a>
          <h1 className="font-sans text-2xl font-extrabold text-nr-ink">Welcome back</h1>
          <p className="mt-1.5 font-sans text-sm text-nr-muted">Sign in to your account</p>
        </div>

        <div className="rounded-xl border border-nr-border bg-white p-7 shadow-card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <p className="rounded-lg border border-nr-redborder bg-nr-redlight px-4 py-2.5 font-sans text-sm text-nr-red">
                {error}
              </p>
            )}

            <div>
              <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-nr-border bg-white px-4 py-2.5 font-sans text-sm text-nr-ink placeholder-nr-placeholder outline-none transition-colors focus:border-nr-red focus:ring-2 focus:ring-nr-red/10"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-nr-border bg-white px-4 py-2.5 font-sans text-sm text-nr-ink placeholder-nr-placeholder outline-none transition-colors focus:border-nr-red focus:ring-2 focus:ring-nr-red/10"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-nr-red py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nr-redhover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center font-sans text-sm text-nr-muted">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-semibold text-nr-red hover:text-nr-redhover transition-colors">
            Create one free
          </a>
        </p>
      </div>
    </main>
  );
}
