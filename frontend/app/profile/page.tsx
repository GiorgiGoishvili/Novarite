"use client";

import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useProfile } from "@/context/ProfileContext";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUserPurchases, type Purchase } from "@/lib/purchases";
import { explorerTxUrl, shortenAddress } from "@/lib/solana";

// ─── module-level constants ────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#DC2626", "#7C3AED", "#2563EB", "#059669", "#D97706", "#DB2777",
];

const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
const IS_MAINNET     = SOLANA_NETWORK === "mainnet-beta";
// USDC on Solana mainnet
const USDC_MINT      = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// ─── types ────────────────────────────────────────────────────────────────────

// idle     → waiting for user to start
// sending  → POST /api/auth/send-* in progress
// sent     → code delivered (or dev-console fallback); showing code input
// verifying → POST /api/auth/verify-* in progress
// verified → success; field is locked
// error    → send failed (not a wrong-code error); show retry
type VerifyStep = "idle" | "sending" | "sent" | "verifying" | "verified" | "error";
type ResetStep  = "idle" | "sent" | "verified";

interface ApiResponse {
  ok?:      boolean;
  error?:   string;
  devHint?: string;
  message?: string;
}

// ─── small UI helpers ─────────────────────────────────────────────────────────

function ic(err?: boolean) {
  return `w-full rounded-lg border ${err ? "border-nr-red" : "border-nr-border"} bg-nr-surface px-3 py-2.5 font-sans text-sm text-nr-ink placeholder:text-nr-faint focus:border-nr-ring focus:outline-none focus:ring-2 focus:ring-nr-ring/30`;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 font-sans text-xs text-nr-red">{msg}</p>;
}

function ProtoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-nr-indigoborder bg-nr-indigobg px-4 py-3 font-sans text-xs text-nr-indigo leading-relaxed">
      {children}
    </div>
  );
}

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return <span className="font-sans text-sm font-medium text-green-600">Saved!</span>;
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 font-sans text-xs font-semibold text-green-700">
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  );
}

function SectionCard({
  title,
  badge,
  children,
  indigo,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  indigo?: boolean;
}) {
  return (
    <section className={`rounded-xl border p-6 ${indigo ? "border-nr-indigoborder bg-nr-indigobg" : "border-nr-border bg-white shadow-card"}`}>
      <div className="mb-5 flex items-center gap-2">
        <h2 className={`font-sans text-sm font-semibold ${indigo ? "text-nr-indigo" : "text-nr-ink"}`}>
          {title}
        </h2>
        {badge && (
          <span className="rounded-full border border-nr-indigoborder bg-white px-2 py-0.5 font-sans text-[10px] font-semibold text-nr-indigo">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

// ─── verification sub-UI ──────────────────────────────────────────────────────

function VerifyCodeInput({
  code,
  onChange,
  onVerify,
  error,
  busy,
  onResend,
  devHint,
  target,
}: {
  code:     string;
  onChange: (v: string) => void;
  onVerify: () => void;
  error:    string;
  busy:     boolean;
  onResend: () => void;
  devHint:  string;
  target:   string; // "email@..." or "+995..."
}) {
  return (
    <div className="mt-3 flex flex-col gap-3">
      <p className="font-sans text-xs text-green-700 font-medium">
        Code sent to <strong>{target}</strong>
      </p>

      {devHint && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-sans text-xs text-amber-800">
          <strong>Dev mode:</strong> Email/SMS provider not configured. {devHint}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={code}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit code"
          disabled={busy}
          className="w-36 rounded-lg border border-nr-border bg-nr-surface px-3 py-2 font-mono text-sm text-nr-ink focus:border-nr-ring focus:outline-none focus:ring-2 focus:ring-nr-ring/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onVerify}
          disabled={busy || code.length !== 6}
          className="rounded-lg bg-nr-red px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-nr-redhover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Verifying…" : "Verify"}
        </button>
      </div>

      {error && <p className="font-sans text-xs text-nr-red">{error}</p>}

      <button
        type="button"
        onClick={onResend}
        disabled={busy}
        className="self-start font-sans text-xs text-nr-muted transition-colors hover:text-nr-ink disabled:opacity-50"
      >
        Resend code
      </button>
    </div>
  );
}

// ─── page component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, changePassword } = useAuth();
  const { profile, updateProfile, saveProfile, updateAndSave } = useProfile();
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

  // Section save badges and errors
  const [profileSaved, setProfileSaved] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [socialSaved,  setSocialSaved]  = useState(false);
  const [profileSaveErr, setProfileSaveErr] = useState("");

  // Email verification
  const [emailStep,    setEmailStep]    = useState<VerifyStep>("idle");
  const [emailCode,    setEmailCode]    = useState("");
  const [emailError,   setEmailError]   = useState("");
  const [emailDevHint, setEmailDevHint] = useState("");

  // Phone verification
  const [phoneStep,    setPhoneStep]    = useState<VerifyStep>("idle");
  const [phoneCode,    setPhoneCode]    = useState("");
  const [phoneError,   setPhoneError]   = useState("");
  const [phoneDevHint, setPhoneDevHint] = useState("");

  // Wallet balance
  const [solBalance,    setSolBalance]    = useState<number | null>(null);
  const [usdcBalance,   setUsdcBalance]   = useState<number | null>(null);
  const [balanceLoading, setBalLoading]   = useState(false);
  const [balanceError,   setBalError]     = useState("");

  // Password change
  const [pwd,        setPwd]       = useState({ current: "", next: "", confirm: "" });
  const [pwdError,   setPwdError]  = useState("");
  const [pwdSuccess, setPwdOK]     = useState(false);

  // Owned games — loaded from localStorage after mount to avoid SSR mismatch
  const [ownedGames, setOwnedGames] = useState<Purchase[]>([]);

  // Forgot password (still mock — no backend user table yet)
  const MOCK_RESET_CODE                  = "123456";
  const [resetStep,  setResetStep]  = useState<ResetStep>("idle");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode,  setResetCode]  = useState("");
  const [resetError, setResetError] = useState("");

  // ── effects ────────────────────────────────────────────────────────────────

  // Redirect only after auth has finished loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  // Load owned games from localStorage (client-side only to avoid SSR mismatch)
  useEffect(() => {
    if (user) setOwnedGames(getUserPurchases(user.username));
  }, [user]);

  // Restore verification states from persisted profile (run once on mount)
  const verifyInit = useRef(false);
  useEffect(() => {
    if (profile && !verifyInit.current) {
      verifyInit.current = true;
      if (profile.emailVerified) setEmailStep("verified");
      if (profile.phoneVerified) setPhoneStep("verified");
      setResetEmail(profile.email);
    }
  }, [profile]);

  // Wallet balance — fetch when connected, clear when disconnected
  const fetchBalances = useCallback(async () => {
    if (!publicKey) return;
    setBalLoading(true);
    setBalError("");
    try {
      const lamports = await connection.getBalance(publicKey);
      setSolBalance(lamports / LAMPORTS_PER_SOL);

      if (IS_MAINNET) {
        try {
          const ata     = await getAssociatedTokenAddress(USDC_MINT, publicKey);
          const account = await getAccount(connection, ata);
          setUsdcBalance(Number(account.amount) / 1_000_000); // USDC has 6 decimals
        } catch {
          setUsdcBalance(0); // user has no USDC account — that's fine
        }
      }
    } catch {
      setBalError("Could not fetch balance. Try again.");
    } finally {
      setBalLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      void fetchBalances();
    } else {
      setSolBalance(null);
      setUsdcBalance(null);
      setBalError("");
    }
  }, [connected, publicKey, fetchBalances]);

  // ── loading / auth guard ───────────────────────────────────────────────────

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-nr-surface flex items-center justify-center">
          <p className="font-sans text-sm text-nr-muted">Loading account…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated || !user || !profile) return null;

  // ── helpers ────────────────────────────────────────────────────────────────

  function flash(setter: (v: boolean) => void) {
    setter(true);
    setTimeout(() => setter(false), 2500);
  }

  async function handleSaveProfile() {
    setProfileSaveErr("");
    const { error } = await saveProfile();
    if (error) { setProfileSaveErr(error); return; }
    flash(setProfileSaved);
  }
  async function handleSaveContact() {
    const { error } = await saveProfile();
    if (!error) flash(setContactSaved);
  }
  async function handleSaveSocial() {
    const { error } = await saveProfile();
    if (!error) flash(setSocialSaved);
  }

  // ── email verification ─────────────────────────────────────────────────────

  async function sendEmailCode() {
    if (!profile) return;
    const email = profile.email.trim();
    if (!email) { setEmailError("Enter an email address first."); return; }
    setEmailStep("sending");
    setEmailError("");
    setEmailDevHint("");
    try {
      const res  = await fetch("/api/auth/send-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as ApiResponse;

      if (res.ok) {
        setEmailStep("sent");
      } else if (res.status === 503 && data.devHint) {
        // Provider not configured in dev — code is in console, still allow entry
        setEmailStep("sent");
        setEmailDevHint(data.devHint);
      } else {
        setEmailStep("error");
        setEmailError(data.error ?? "Failed to send code. Try again.");
      }
    } catch {
      setEmailStep("error");
      setEmailError("Network error. Please try again.");
    }
  }

  async function verifyEmailCode() {
    if (!profile) return;
    setEmailStep("verifying");
    setEmailError("");
    try {
      const res  = await fetch("/api/auth/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email.trim(), code: emailCode }),
      });
      const data = await res.json() as ApiResponse;

      if (res.ok) {
        await updateAndSave({ emailVerified: true });
        setEmailStep("verified");
        setEmailCode("");
      } else {
        setEmailStep("sent"); // stay in "sent" so they can try a different code
        setEmailError(data.error ?? "Verification failed.");
      }
    } catch {
      setEmailStep("sent");
      setEmailError("Network error. Please try again.");
    }
  }

  // ── phone verification ─────────────────────────────────────────────────────

  async function sendPhoneCode() {
    if (!profile) return;
    const phone = profile.phone.trim();
    if (!phone) { setPhoneError("Enter a phone number first."); return; }
    setPhoneStep("sending");
    setPhoneError("");
    setPhoneDevHint("");
    try {
      const res  = await fetch("/api/auth/send-phone-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json() as ApiResponse;

      if (res.ok) {
        setPhoneStep("sent");
      } else if (res.status === 503 && data.devHint) {
        setPhoneStep("sent");
        setPhoneDevHint(data.devHint);
      } else {
        setPhoneStep("error");
        setPhoneError(data.error ?? "Failed to send SMS. Try again.");
      }
    } catch {
      setPhoneStep("error");
      setPhoneError("Network error. Please try again.");
    }
  }

  async function verifyPhoneCode() {
    if (!profile) return;
    setPhoneStep("verifying");
    setPhoneError("");
    try {
      const res  = await fetch("/api/auth/verify-phone-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: profile.phone.trim(), code: phoneCode }),
      });
      const data = await res.json() as ApiResponse;

      if (res.ok) {
        await updateAndSave({ phoneVerified: true });
        setPhoneStep("verified");
        setPhoneCode("");
      } else {
        setPhoneStep("sent");
        setPhoneError(data.error ?? "Verification failed.");
      }
    } catch {
      setPhoneStep("sent");
      setPhoneError("Network error. Please try again.");
    }
  }

  // ── password change ────────────────────────────────────────────────────────

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPwdError("");
    setPwdOK(false);
    if (pwd.next.length < 8)      { setPwdError("New password must be at least 8 characters."); return; }
    if (pwd.next !== pwd.confirm) { setPwdError("Passwords do not match."); return; }
    const err = await changePassword(pwd.current, pwd.next);
    if (err) { setPwdError(err); return; }
    setPwdOK(true);
    setPwd({ current: "", next: "", confirm: "" });
  }

  // ── forgot password (still mock — backend user table needed) ───────────────

  function sendResetCode() {
    setResetStep("sent");
    setResetCode("");
    setResetError("");
  }

  function verifyResetCode() {
    if (resetCode === MOCK_RESET_CODE) {
      setResetStep("verified");
      setResetError("");
    } else {
      setResetError("Invalid code.");
    }
  }

  // ── derived wallet display values ──────────────────────────────────────────

  const walletName    = wallet?.adapter.name ?? "Unknown";
  const walletAddress = publicKey?.toBase58() ?? null;
  const shortAddress  = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : null;
  const avatarLetter  = (profile.displayName || profile.username)[0]?.toUpperCase() ?? "?";

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Header />
      <main className="min-h-screen bg-nr-surface">
        <div className="mx-auto max-w-3xl px-5 py-12">

          {/* Page header ────────────────────────────────────────────────────── */}
          <div className="mb-10 flex items-center gap-5">
            <div
              className="h-16 w-16 shrink-0 rounded-full flex items-center justify-center text-2xl font-extrabold text-white shadow-sm"
              style={{ backgroundColor: profile.avatarColor }}
            >
              {avatarLetter}
            </div>
            <div>
              <h1 className="font-sans text-2xl font-extrabold tracking-tight text-nr-ink">
                {profile.displayName || profile.username}
              </h1>
              <p className="font-sans text-sm text-nr-muted">@{profile.username}</p>
              <p className="font-sans text-xs text-nr-faint">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">

            {/* ── 1. Public Profile ────────────────────────────────────────── */}
            <SectionCard title="Public profile">
              <div className="mb-6 flex items-center gap-5">
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center text-xl font-extrabold text-white shadow-sm shrink-0"
                  style={{ backgroundColor: profile.avatarColor }}
                >
                  {avatarLetter}
                </div>
                <div>
                  <p className="mb-2 font-sans text-xs font-medium text-nr-body">Avatar color</p>
                  <div className="flex gap-2">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateProfile({ avatarColor: color })}
                        aria-label={`Avatar color ${color}`}
                        className={`h-7 w-7 rounded-full border-2 transition-transform ${profile.avatarColor === color ? "border-nr-ink scale-110" : "border-transparent hover:scale-105"}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 font-sans text-xs text-nr-faint">Photo upload coming soon.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-medium text-nr-body">Display name</label>
                  <input type="text" value={profile.displayName} onChange={(e) => updateProfile({ displayName: e.target.value })} placeholder={profile.username} className={ic()} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-medium text-nr-body">Username</label>
                  <input type="text" value={profile.username} onChange={(e) => { updateProfile({ username: e.target.value }); setProfileSaveErr(""); }} className={ic()} />
                  <p className="mt-1 font-sans text-xs text-nr-faint">Unique. Changing it will update your public profile URL.</p>
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-medium text-nr-body">Studio / team name</label>
                  <input type="text" value={profile.studioName} onChange={(e) => updateProfile({ studioName: e.target.value })} placeholder="Solo dev, Pixel Co., …" className={ic()} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-medium text-nr-body">Developer role</label>
                  <input type="text" value={profile.role} onChange={(e) => updateProfile({ role: e.target.value })} placeholder="Programmer, Designer, …" className={ic()} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-medium text-nr-body">Location</label>
                  <input type="text" value={profile.location} onChange={(e) => updateProfile({ location: e.target.value })} placeholder="City, Country" className={ic()} />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block font-sans text-xs font-medium text-nr-body">Bio</label>
                <textarea value={profile.bio} onChange={(e) => updateProfile({ bio: e.target.value })} rows={3} placeholder="Tell players a bit about yourself…" className={`${ic()} resize-none`} />
              </div>

              <div className="mt-5 flex items-center gap-3 flex-wrap">
                <button onClick={handleSaveProfile} className="rounded-lg bg-nr-red px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nr-redhover">
                  Save profile
                </button>
                <SavedBadge show={profileSaved} />
                {profileSaveErr && (
                  <span className="font-sans text-sm font-medium text-nr-red">{profileSaveErr}</span>
                )}
              </div>
            </SectionCard>

            {/* ── 2. Contact Info ──────────────────────────────────────────── */}
            <SectionCard title="Contact info">
              <div className="flex flex-col gap-6">

                {/* Email ── */}
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <label className="font-sans text-xs font-medium text-nr-body">Email address</label>
                    {emailStep === "verified" && <VerifiedBadge />}
                  </div>

                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => {
                      updateProfile({ email: e.target.value, emailVerified: false });
                      setEmailStep("idle");
                      setEmailError("");
                      setEmailDevHint("");
                    }}
                    className={ic()}
                  />

                  {emailStep === "idle" && (
                    <div className="mt-2">
                      {emailError && <FieldError msg={emailError} />}
                      <button
                        type="button"
                        onClick={sendEmailCode}
                        className="mt-1 font-sans text-xs font-semibold text-nr-red transition-colors hover:text-nr-redhover"
                      >
                        Send verification code →
                      </button>
                    </div>
                  )}

                  {emailStep === "sending" && (
                    <p className="mt-2 font-sans text-xs text-nr-muted">Sending code…</p>
                  )}

                  {(emailStep === "sent" || emailStep === "verifying") && (
                    <VerifyCodeInput
                      code={emailCode}
                      onChange={setEmailCode}
                      onVerify={verifyEmailCode}
                      error={emailError}
                      busy={emailStep === "verifying"}
                      onResend={sendEmailCode}
                      devHint={emailDevHint}
                      target={profile.email}
                    />
                  )}

                  {emailStep === "verified" && (
                    <p className="mt-1.5 font-sans text-xs text-green-600">Email verified successfully.</p>
                  )}

                  {emailStep === "error" && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      <p className="font-sans text-xs text-nr-red">{emailError}</p>
                      <button
                        type="button"
                        onClick={() => { setEmailStep("idle"); setEmailError(""); }}
                        className="self-start font-sans text-xs font-semibold text-nr-muted transition-colors hover:text-nr-ink"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>

                {/* Phone ── */}
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <label className="font-sans text-xs font-medium text-nr-body">Phone number</label>
                    {phoneStep === "verified" && <VerifiedBadge />}
                  </div>

                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => {
                      updateProfile({ phone: e.target.value, phoneVerified: false });
                      setPhoneStep("idle");
                      setPhoneError("");
                      setPhoneDevHint("");
                    }}
                    placeholder="+995 555 123456"
                    className={ic()}
                  />
                  <p className="mt-1 font-sans text-xs text-nr-faint">International format required, e.g. +995 555 123456</p>

                  {phoneStep === "idle" && profile.phone.trim() && (
                    <div className="mt-2">
                      {phoneError && <FieldError msg={phoneError} />}
                      <button
                        type="button"
                        onClick={sendPhoneCode}
                        className="mt-1 font-sans text-xs font-semibold text-nr-red transition-colors hover:text-nr-redhover"
                      >
                        Send SMS code →
                      </button>
                    </div>
                  )}

                  {phoneStep === "sending" && (
                    <p className="mt-2 font-sans text-xs text-nr-muted">Sending SMS…</p>
                  )}

                  {(phoneStep === "sent" || phoneStep === "verifying") && (
                    <VerifyCodeInput
                      code={phoneCode}
                      onChange={setPhoneCode}
                      onVerify={verifyPhoneCode}
                      error={phoneError}
                      busy={phoneStep === "verifying"}
                      onResend={sendPhoneCode}
                      devHint={phoneDevHint}
                      target={profile.phone}
                    />
                  )}

                  {phoneStep === "verified" && (
                    <p className="mt-1.5 font-sans text-xs text-green-600">Phone verified successfully.</p>
                  )}

                  {phoneStep === "error" && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      <p className="font-sans text-xs text-nr-red">{phoneError}</p>
                      <button
                        type="button"
                        onClick={() => { setPhoneStep("idle"); setPhoneError(""); }}
                        className="self-start font-sans text-xs font-semibold text-nr-muted transition-colors hover:text-nr-ink"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button onClick={handleSaveContact} className="rounded-lg bg-nr-red px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nr-redhover">
                  Save contact info
                </button>
                <SavedBadge show={contactSaved} />
              </div>
            </SectionCard>

            {/* ── 3. Connected Wallet ──────────────────────────────────────── */}
            <SectionCard title="Connected wallet" badge="Optional · Web3" indigo>
              <p className="mb-4 font-sans text-xs text-nr-body leading-relaxed">
                Connect a Solana wallet to use optional on-chain features like supporter passes.
                The platform works fully without it.
              </p>

              {connected && walletAddress ? (
                <div className="mb-4 flex flex-col gap-3">

                  {/* Status + wallet name */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                    <span className="font-sans text-sm font-semibold text-nr-ink">Connected</span>
                    <span className="rounded-full border border-nr-indigoborder bg-white px-2 py-0.5 font-sans text-xs text-nr-indigo">
                      {walletName}
                    </span>
                    <span className="rounded-full border border-nr-border bg-white px-2 py-0.5 font-sans text-xs text-nr-muted capitalize">
                      {SOLANA_NETWORK}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="rounded-lg border border-nr-indigoborder bg-white p-3">
                    <p className="font-sans text-xs font-medium text-nr-faint mb-0.5">Wallet address</p>
                    <p className="font-mono text-sm font-semibold text-nr-ink">{shortAddress}</p>
                    <p className="font-mono text-[10px] text-nr-faint break-all mt-0.5">{walletAddress}</p>
                  </div>

                  {/* Balance */}
                  <div className="rounded-lg border border-nr-indigoborder bg-white p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-sans text-xs font-medium text-nr-faint">Balances</p>
                      <button
                        type="button"
                        onClick={() => void fetchBalances()}
                        disabled={balanceLoading}
                        className="font-sans text-xs text-nr-indigo transition-colors hover:text-nr-ink disabled:opacity-50"
                        title="Refresh balances"
                      >
                        {balanceLoading ? "Loading…" : "↻ Refresh"}
                      </button>
                    </div>

                    {balanceError ? (
                      <p className="font-sans text-xs text-nr-red">{balanceError}</p>
                    ) : balanceLoading ? (
                      <p className="font-sans text-xs text-nr-faint">Fetching balance…</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-lg font-bold text-nr-ink">
                            {solBalance !== null ? solBalance.toFixed(4) : "—"}
                          </span>
                          <span className="font-sans text-xs text-nr-muted">SOL</span>
                        </div>

                        {IS_MAINNET ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono text-base font-semibold text-nr-ink">
                              {usdcBalance !== null ? usdcBalance.toFixed(2) : "—"}
                            </span>
                            <span className="font-sans text-xs text-nr-muted">USDC</span>
                          </div>
                        ) : (
                          <p className="font-sans text-xs text-nr-faint">
                            USDC balance available on mainnet only.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-nr-faint shrink-0" />
                  <span className="font-sans text-sm text-nr-muted">No wallet connected</span>
                </div>
              )}

              <WalletMultiButton />

              <p className="mt-3 font-sans text-xs text-nr-faint leading-relaxed">
                Connects with Phantom, Solflare, and other Solana wallets. On-chain supporter passes coming soon.
              </p>
            </SectionCard>

            {/* ── 3.5 Owned Games ─────────────────────────────────────────── */}
            <SectionCard title="Owned games &amp; access passes">
              {ownedGames.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <span className="text-4xl" aria-hidden="true">🎮</span>
                  <p className="font-sans text-sm text-nr-muted">
                    You don&apos;t own any games yet.
                  </p>
                  <a
                    href="/#games"
                    className="font-sans text-sm font-semibold text-nr-red transition-colors hover:text-nr-redhover"
                  >
                    Browse games →
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {ownedGames.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-nr-border bg-nr-surface p-4"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-sans text-sm font-semibold text-nr-ink">
                            {p.gameTitle}
                          </p>
                          <p className="mt-0.5 font-sans text-xs text-nr-muted">
                            {p.accessType === "free" ? "Free access" : `${p.priceSol} SOL`}
                            {" · "}
                            {new Date(p.purchasedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold ${
                            p.accessType === "free"
                              ? "bg-green-100 text-green-700"
                              : "bg-nr-indigobg border border-nr-indigoborder text-nr-indigo"
                          }`}
                        >
                          {p.accessType === "free" ? "Free" : "Purchased"}
                        </span>
                      </div>

                      {p.transactionSignature && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-sans text-xs text-nr-faint">Tx:</span>
                          <span className="font-mono text-xs text-nr-muted">
                            {shortenAddress(p.transactionSignature, 6)}
                          </span>
                          <a
                            href={explorerTxUrl(p.transactionSignature)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-sans text-xs font-semibold text-nr-indigo transition-colors hover:text-nr-ink"
                          >
                            View on Explorer →
                          </a>
                        </div>
                      )}

                      {p.downloadUrl && (
                        <div className="mt-3">
                          <a
                            href={p.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-nr-border bg-white px-4 py-2 font-sans text-sm font-semibold text-nr-ink transition-colors hover:bg-nr-surface"
                          >
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </a>
                        </div>
                      )}

                      {p.buyerWallet && (
                        <p className="mt-2 font-sans text-xs text-nr-faint">
                          Wallet: <span className="font-mono">{shortenAddress(p.buyerWallet)}</span>
                          {" · "}
                          <span className="capitalize">{p.network}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* ── 4. Social Links ──────────────────────────────────────────── */}
            <SectionCard title="Social links">
              <div className="flex flex-col gap-4">
                {(
                  [
                    { key: "socialX",        label: "X / Twitter",     placeholder: "https://x.com/yourhandle" },
                    { key: "socialGithub",   label: "GitHub",           placeholder: "https://github.com/yourusername" },
                    { key: "socialLinkedin", label: "LinkedIn",         placeholder: "https://linkedin.com/in/yourprofile" },
                    { key: "socialWebsite",  label: "Personal website", placeholder: "https://yoursite.com" },
                  ] as const
                ).map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="mb-1.5 block font-sans text-xs font-medium text-nr-body">{label}</label>
                    <input type="url" value={profile[key]} onChange={(e) => updateProfile({ [key]: e.target.value })} placeholder={placeholder} className={ic()} />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <button onClick={handleSaveSocial} className="rounded-lg bg-nr-red px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nr-redhover">
                  Save links
                </button>
                <SavedBadge show={socialSaved} />
              </div>
            </SectionCard>

            {/* ── 5. Account Security ──────────────────────────────────────── */}
            <SectionCard title="Account security">

              {/* Change password */}
              <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wide text-nr-faint">
                Change password
              </h3>
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-medium text-nr-body">Current password</label>
                  <input type="password" value={pwd.current} onChange={(e) => { setPwd((p) => ({ ...p, current: e.target.value })); setPwdError(""); setPwdOK(false); }} autoComplete="current-password" className={ic()} />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-medium text-nr-body">New password</label>
                  <input type="password" value={pwd.next} onChange={(e) => { setPwd((p) => ({ ...p, next: e.target.value })); setPwdError(""); setPwdOK(false); }} autoComplete="new-password" className={ic()} />
                  <p className="mt-1 font-sans text-xs text-nr-faint">Minimum 8 characters.</p>
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-medium text-nr-body">Confirm new password</label>
                  <input type="password" value={pwd.confirm} onChange={(e) => { setPwd((p) => ({ ...p, confirm: e.target.value })); setPwdError(""); setPwdOK(false); }} autoComplete="new-password" className={ic(pwd.confirm.length > 0 && pwd.next !== pwd.confirm)} />
                  {pwd.confirm.length > 0 && pwd.next !== pwd.confirm && <FieldError msg="Passwords do not match." />}
                </div>
                {pwdError && <FieldError msg={pwdError} />}
                {pwdSuccess && (
                  <p className="font-sans text-sm font-medium text-green-600">Password updated successfully.</p>
                )}
                <div>
                  <button type="submit" className="rounded-lg bg-nr-red px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nr-redhover">
                    Update password
                  </button>
                </div>
              </form>

              <div className="my-6 border-t border-nr-border" />

              {/* Forgot password (mock until backend user table exists) */}
              <h3 className="mb-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-nr-faint">
                Forgot your password?
              </h3>
              <p className="mb-4 font-sans text-xs text-nr-muted">
                Enter your email and we will send a reset code.
              </p>

              {resetStep === "idle" && (
                <div className="flex flex-col gap-3">
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="your@email.com" className={ic()} />
                  <div>
                    <button type="button" onClick={sendResetCode} className="rounded-lg border border-nr-border px-5 py-2.5 font-sans text-sm font-semibold text-nr-ink transition-colors hover:bg-nr-surface">
                      Send password reset code
                    </button>
                  </div>
                  <ProtoNote>
                    Prototype only: password reset emails will be sent once a backend user database is connected. Test code: <strong>{MOCK_RESET_CODE}</strong>
                  </ProtoNote>
                </div>
              )}

              {resetStep === "sent" && (
                <div className="flex flex-col gap-3">
                  <p className="font-sans text-xs text-nr-muted">
                    Code sent to <strong>{resetEmail}</strong> (prototype mode — use <strong>{MOCK_RESET_CODE}</strong>).
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => { setResetCode(e.target.value); setResetError(""); }}
                      placeholder="Enter code"
                      maxLength={6}
                      className="w-36 rounded-lg border border-nr-border bg-nr-surface px-3 py-2 font-mono text-sm text-nr-ink focus:border-nr-ring focus:outline-none focus:ring-2 focus:ring-nr-ring/30"
                    />
                    <button type="button" onClick={verifyResetCode} className="rounded-lg bg-nr-red px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-nr-redhover">
                      Verify code
                    </button>
                    <button type="button" onClick={() => { setResetStep("idle"); setResetError(""); setResetCode(""); }} className="font-sans text-xs text-nr-muted transition-colors hover:text-nr-ink">
                      Cancel
                    </button>
                  </div>
                  {resetError && <FieldError msg={resetError} />}
                </div>
              )}

              {resetStep === "verified" && (
                <div className="flex flex-col gap-2">
                  <p className="font-sans text-sm font-semibold text-green-600">Code verified.</p>
                  <p className="font-sans text-xs text-nr-muted">Use the "Change password" form above to set a new password.</p>
                  <button type="button" onClick={() => { setResetStep("idle"); setResetCode(""); }} className="self-start font-sans text-xs text-nr-red transition-colors hover:text-nr-redhover">
                    ← Back
                  </button>
                </div>
              )}
            </SectionCard>

            <p className="pb-4 text-center font-sans text-xs text-nr-faint">
              Your profile is saved to your Novarite account.
            </p>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
