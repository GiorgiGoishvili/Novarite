"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { saveGame, type GameListing } from "@/lib/games";
import { isValidPublicKey, SOLANA_NETWORK } from "@/lib/solana";

async function publishGameToSupabase(game: GameListing): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/games/publish", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        local_game_id:      game.id,
        title:              game.title,
        short_desc:         game.shortDesc,
        description:        game.fullDesc,
        engine:             game.engine,
        genre:              game.genre,
        tags:               game.tags,
        game_status:        game.gameStatus,
        build_types:        game.buildTypes,
        platform:           game.platform,
        download_url:       game.downloadUrl,
        file_size_label:    game.fileSizeLabel,
        game_version:       game.version,
        pricing:            game.pricing,
        price_sol:          game.priceSol,
        developer_wallet:   game.developerWallet,
        developer_username: game.developerUsername,
        external_play_url:  game.externalPlayUrl,
        trailer_url:        game.trailerUrl,
        is_published:       game.visibility === "published",
        network:            SOLANA_NETWORK,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string; details?: string; code?: string; hint?: string };
      const msg  = body.details || body.error || `Server error (${res.status})`;
      const code = body.code ? ` [${body.code}]` : "";
      const hint = body.hint ? ` — ${body.hint}` : "";
      return { ok: false, error: `${msg}${code}${hint}` };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { ok: false, error: `Could not reach server: ${msg}` };
  }
}

const ENGINES = [
  "HTML5 / Browser",
  "Godot",
  "Unity",
  "Unreal Engine",
  "GameMaker",
  "Construct",
  "Ren'Py",
  "RPG Maker",
  "Pygame / Python",
  "Custom engine",
  "Other",
];

const BUILD_TYPES = [
  { id: "html5",   label: "HTML5 / Browser playable" },
  { id: "webgl",   label: "WebGL build" },
  { id: "win",     label: "Windows (.exe / .zip)" },
  { id: "mac",     label: "macOS (.app / .zip)" },
  { id: "linux",   label: "Linux (.zip / AppImage)" },
  { id: "android", label: "Android (.apk)" },
  { id: "source",  label: "Source code" },
];

const GENRES = [
  "Platformer", "Puzzle", "Horror", "Adventure", "RPG", "Simulation",
  "Strategy", "Farming / Cozy", "Visual Novel", "Shooter", "Arcade",
  "Sports", "Educational", "Other",
];

const PLATFORMS = [
  "Windows",
  "macOS",
  "Linux",
  "Web / HTML5",
  "Android",
  "Cross-platform",
];

interface Errors {
  title?: string;
  shortDesc?: string;
  gameStatus?: string;
  engine?: string;
  downloadUrl?: string;
  priceSol?: string;
  payoutWallet?: string;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 font-sans text-xs text-nr-red">{msg}</p>;
}

export default function UploadPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { publicKey } = useWallet();
  const router = useRouter();

  // Form fields
  const [title,           setTitle]           = useState("");
  const [shortDesc,       setShortDesc]       = useState("");
  const [fullDesc,        setFullDesc]        = useState("");
  const [gameStatus,      setGameStatus]      = useState("");
  const [engine,          setEngine]          = useState("");
  const [genre,           setGenre]           = useState("");
  const [tags,            setTags]            = useState("");
  const [buildTypes,      setBuildTypes]      = useState<string[]>([]);
  const [platform,        setPlatform]        = useState("");
  const [downloadUrl,     setDownloadUrl]     = useState("");
  const [fileSizeLabel,   setFileSizeLabel]   = useState("");
  const [version,         setVersion]         = useState("");
  const [pricing,         setPricing]         = useState<"free" | "paid-sol">("free");
  const [priceSol,        setPriceSol]        = useState("");
  const [payoutWallet,    setPayoutWallet]    = useState("");
  const [trailerUrl,      setTrailerUrl]      = useState("");
  const [externalPlayUrl, setExternalPlayUrl] = useState("");
  const [errors,          setErrors]          = useState<Errors>({});
  const [publishedGame,   setPublishedGame]   = useState<GameListing | null>(null);
  const [isSaving,        setIsSaving]        = useState(false);
  const [publishError,    setPublishError]    = useState("");

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  // Auto-fill payout wallet from connected wallet when pricing switches to paid
  useEffect(() => {
    if (pricing === "paid-sol" && publicKey && !payoutWallet) {
      setPayoutWallet(publicKey.toBase58());
    }
  }, [pricing, publicKey, payoutWallet]);

  // Keep payout wallet in sync if wallet connects while paid is selected
  useEffect(() => {
    if (pricing === "paid-sol" && publicKey) {
      setPayoutWallet(publicKey.toBase58());
    }
  }, [publicKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleBuildType(id: string) {
    setBuildTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  // Non-web platforms require a download URL
  const isNonWeb = platform !== "" && platform !== "Web / HTML5";

  function validate(): Errors {
    const e: Errors = {};
    if (!title.trim())     e.title      = "Game title is required.";
    if (!shortDesc.trim()) e.shortDesc  = "Short description is required.";
    if (!gameStatus)       e.gameStatus = "Please select a game status.";
    if (!engine)           e.engine     = "Please select an engine.";
    if (isNonWeb && !downloadUrl.trim())
      e.downloadUrl = "A download URL is required for non-web games.";
    if (downloadUrl.trim() && !/^https?:\/\/.+/.test(downloadUrl.trim()))
      e.downloadUrl = "Download URL must start with http:// or https://";
    if (pricing === "paid-sol") {
      const p = parseFloat(priceSol);
      if (isNaN(p) || p <= 0) e.priceSol = "Price must be greater than 0.";
      if (!isValidPublicKey(payoutWallet.trim()))
        e.payoutWallet = "Enter a valid Solana wallet address.";
    }
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setPublishError("");
    setIsSaving(true);

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const game = saveGame({
      title:             title.trim(),
      shortDesc:         shortDesc.trim(),
      fullDesc:          fullDesc.trim(),
      engine,
      genre,
      tags:              tagList,
      gameStatus:        gameStatus as GameListing["gameStatus"],
      buildTypes,
      platform,
      downloadUrl:       downloadUrl.trim(),
      fileSizeLabel:     fileSizeLabel.trim(),
      version:           version.trim(),
      pricing,
      priceSol:          pricing === "paid-sol" ? parseFloat(priceSol) : 0,
      developerWallet:   pricing === "paid-sol" ? payoutWallet.trim() : "",
      developerUsername: user?.username ?? "",
      externalPlayUrl:   externalPlayUrl.trim(),
      trailerUrl:        trailerUrl.trim(),
      visibility:        "published",
    });

    const result = await publishGameToSupabase(game);
    setIsSaving(false);

    if (!result.ok) {
      setPublishError(result.error ?? "Failed to save game. Please try again.");
      return;
    }

    setPublishedGame(game);
  }

  // ── Loading / auth guard UI ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-nr-surface flex items-center justify-center">
          <p className="font-sans text-sm text-nr-muted">Loading…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) return null;

  // ── Success screen ─────────────────────────────────────────────────────────

  if (publishedGame) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white flex items-center justify-center px-5 py-20">
          <div className="max-w-md text-center">
            <span className="text-6xl">🎉</span>
            <h1 className="mt-4 font-sans text-2xl font-extrabold text-nr-ink">
              &ldquo;{publishedGame.title}&rdquo; published!
            </h1>
            <p className="mt-3 font-sans text-sm text-nr-muted">
              Your game is live and will appear in Browse on all devices.
            </p>
            {publishedGame.pricing === "paid-sol" && (
              <div className="mt-3 rounded-lg border border-nr-indigoborder bg-nr-indigobg px-4 py-3 font-sans text-xs text-nr-indigo text-left">
                <strong>Paid game:</strong> Players on devnet can buy access for{" "}
                <strong>{publishedGame.priceSol} SOL</strong>. Payment goes to{" "}
                <span className="font-mono">
                  {publishedGame.developerWallet.slice(0, 6)}…
                  {publishedGame.developerWallet.slice(-4)}
                </span>
                .
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => setPublishedGame(null)}
                className="rounded-lg border border-nr-border px-5 py-2.5 font-sans text-sm font-semibold text-nr-ink hover:bg-nr-surface transition-colors"
              >
                Upload another game
              </button>
              <a
                href="/#games"
                className="rounded-lg bg-nr-red px-5 py-2.5 font-sans text-sm font-semibold text-white hover:bg-nr-redhover transition-colors"
              >
                View in Browse
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  const inputCls = (err?: string) =>
    `w-full rounded-lg border bg-white px-4 py-2.5 font-sans text-sm text-nr-ink placeholder-nr-placeholder outline-none transition-colors focus:ring-2 ${err ? "border-nr-red focus:border-nr-red focus:ring-nr-red/10" : "border-nr-border focus:border-nr-red focus:ring-nr-red/10"}`;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-nr-surface py-12">
        <div className="mx-auto max-w-2xl px-5">

          <div className="mb-8">
            <h1 className="font-sans text-3xl font-extrabold tracking-tight text-nr-ink">
              Publish your game
            </h1>
            <p className="mt-2 font-sans text-sm text-nr-muted">
              Fill in the details below. Published games appear in Browse on all devices immediately.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

            {/* ── Basic info ──────────────────────────────────────────────── */}
            <fieldset className="rounded-xl border border-nr-border bg-white p-6 shadow-card">
              <legend className="px-1 font-sans text-sm font-semibold text-nr-ink">
                Basic information
              </legend>
              <div className="mt-4 flex flex-col gap-5">

                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                    Game title <span className="text-nr-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })); }}
                    placeholder="My Awesome Game"
                    className={inputCls(errors.title)}
                  />
                  <FieldError msg={errors.title} />
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                    Short description <span className="text-nr-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={(e) => { setShortDesc(e.target.value); setErrors((p) => ({ ...p, shortDesc: undefined })); }}
                    maxLength={120}
                    placeholder="One or two sentences about your game (max 120 chars)"
                    className={inputCls(errors.shortDesc)}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <FieldError msg={errors.shortDesc} />
                    <span className="ml-auto font-sans text-xs text-nr-faint">{shortDesc.length}/120</span>
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                    Full description
                  </label>
                  <textarea
                    value={fullDesc}
                    onChange={(e) => setFullDesc(e.target.value)}
                    rows={5}
                    placeholder="Tell players what your game is about, how it plays, what inspired you…"
                    className="w-full rounded-lg border border-nr-border bg-white px-4 py-2.5 font-sans text-sm text-nr-ink placeholder-nr-placeholder outline-none transition-colors focus:border-nr-red focus:ring-2 focus:ring-nr-red/10 resize-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                      Engine <span className="text-nr-red">*</span>
                    </label>
                    <select
                      value={engine}
                      onChange={(e) => { setEngine(e.target.value); setErrors((p) => ({ ...p, engine: undefined })); }}
                      className={inputCls(errors.engine)}
                    >
                      <option value="">Select engine…</option>
                      {ENGINES.map((eng) => (
                        <option key={eng} value={eng}>{eng}</option>
                      ))}
                    </select>
                    <FieldError msg={errors.engine} />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                      Genre
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className={inputCls()}
                    >
                      <option value="">Select genre…</option>
                      {GENRES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                    Game status <span className="text-nr-red">*</span>
                  </label>
                  <select
                    value={gameStatus}
                    onChange={(e) => { setGameStatus(e.target.value); setErrors((p) => ({ ...p, gameStatus: undefined })); }}
                    className={inputCls(errors.gameStatus)}
                  >
                    <option value="">Select status…</option>
                    <option value="prototype">Prototype — Very early, expect bugs</option>
                    <option value="demo">Demo — A playable slice, not the full game</option>
                    <option value="early-access">Early Access — Playable but still in development</option>
                    <option value="released">Released — Feature-complete and ready to play</option>
                  </select>
                  <FieldError msg={errors.gameStatus} />
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. pixel art, jam, 2d, relaxing (comma separated)"
                    className={inputCls()}
                  />
                </div>
              </div>
            </fieldset>

            {/* ── Build type ──────────────────────────────────────────────── */}
            <fieldset className="rounded-xl border border-nr-border bg-white p-6 shadow-card">
              <legend className="px-1 font-sans text-sm font-semibold text-nr-ink">
                Build type
              </legend>
              <p className="mt-1 font-sans text-xs text-nr-muted mb-4">
                Select all that apply.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {BUILD_TYPES.map(({ id, label }) => (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      buildTypes.includes(id)
                        ? "border-nr-red bg-nr-redlight"
                        : "border-nr-border hover:border-nr-ring"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-nr-red"
                      checked={buildTypes.includes(id)}
                      onChange={() => toggleBuildType(id)}
                    />
                    <span className="font-sans text-sm text-nr-body">{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* ── Assets ──────────────────────────────────────────────────── */}
            <fieldset className="rounded-xl border border-nr-border bg-white p-6 shadow-card">
              <legend className="px-1 font-sans text-sm font-semibold text-nr-ink">
                Assets
              </legend>
              <div className="mt-4 flex flex-col gap-5">

                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                    External playable link
                  </label>
                  <input
                    type="url"
                    value={externalPlayUrl}
                    onChange={(e) => setExternalPlayUrl(e.target.value)}
                    placeholder="https://itch.io/embed-upload/… or your own host"
                    className={inputCls()}
                  />
                  <p className="mt-1 font-sans text-xs text-nr-faint">
                    Optional. For HTML5 builds hosted externally.
                  </p>
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                    Trailer / video link
                  </label>
                  <input
                    type="url"
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=… or Vimeo URL"
                    className={inputCls()}
                  />
                  <p className="mt-1 font-sans text-xs text-nr-faint">
                    Optional. YouTube or Vimeo.
                  </p>
                </div>

                <div className="rounded-lg border border-nr-border bg-nr-surface p-4 font-sans text-xs text-nr-muted">
                  Cover image and file uploads require a backend storage provider (e.g. S3, Cloudflare R2).
                  Coming soon — for now, add a download URL below.
                </div>
              </div>
            </fieldset>

            {/* ── Download / Platform ──────────────────────────────────────── */}
            <fieldset className="rounded-xl border border-nr-border bg-white p-6 shadow-card">
              <legend className="px-1 font-sans text-sm font-semibold text-nr-ink">
                Download &amp; platform
              </legend>
              <div className="mt-4 flex flex-col gap-5">

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                      Primary platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className={inputCls()}
                    >
                      <option value="">Select platform…</option>
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <p className="mt-1 font-sans text-xs text-nr-faint">
                      Shown as a badge on the game card.
                    </p>
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                      Version
                    </label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0"
                      className={inputCls()}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                    Download URL {isNonWeb && <span className="text-nr-red">*</span>}
                  </label>
                  <input
                    type="url"
                    value={downloadUrl}
                    onChange={(e) => { setDownloadUrl(e.target.value); setErrors((p) => ({ ...p, downloadUrl: undefined })); }}
                    placeholder="https://drive.google.com/uc?export=download&id=…"
                    className={inputCls(errors.downloadUrl)}
                  />
                  <FieldError msg={errors.downloadUrl} />
                  <div className="mt-1.5 rounded-lg border border-nr-indigoborder bg-nr-indigobg px-3 py-2 font-sans text-xs text-nr-indigo">
                    <strong>Google Drive:</strong> Upload your file → Share → &quot;Anyone with the link&quot; → copy link.
                    Then change <code className="font-mono bg-white/60 px-1 rounded">/file/d/ID/view</code> to{" "}
                    <code className="font-mono bg-white/60 px-1 rounded">uc?export=download&amp;id=ID</code>
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                    File size (optional)
                  </label>
                  <input
                    type="text"
                    value={fileSizeLabel}
                    onChange={(e) => setFileSizeLabel(e.target.value)}
                    placeholder="e.g. 45 MB"
                    className={inputCls()}
                  />
                </div>
              </div>
            </fieldset>

            {/* ── Pricing ─────────────────────────────────────────────────── */}
            <fieldset className="rounded-xl border border-nr-border bg-white p-6 shadow-card">
              <legend className="px-1 font-sans text-sm font-semibold text-nr-ink">
                Pricing
              </legend>

              <div className="mt-4 flex flex-col gap-3">
                {(
                  [
                    { id: "free"     as const, label: "Free",         desc: "Anyone can access your game at no cost." },
                    { id: "paid-sol" as const, label: "Paid with SOL", desc: "Players pay in SOL on devnet. Payment goes directly to your wallet." },
                  ]
                ).map(({ id, label, desc }) => (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      pricing === id
                        ? id === "paid-sol"
                          ? "border-nr-indigoborder bg-nr-indigobg"
                          : "border-nr-red bg-nr-redlight"
                        : "border-nr-border hover:border-nr-ring"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pricing"
                      value={id}
                      checked={pricing === id}
                      onChange={() => setPricing(id)}
                      className="mt-0.5 accent-nr-red"
                    />
                    <div>
                      <span className="font-sans text-sm font-semibold text-nr-ink flex items-center gap-2">
                        {label}
                        {id === "paid-sol" && (
                          <span className="rounded-full bg-nr-indigobg border border-nr-indigoborder px-2 py-0.5 font-sans text-[10px] font-semibold text-nr-indigo">
                            Solana devnet
                          </span>
                        )}
                      </span>
                      <p className="mt-0.5 font-sans text-xs text-nr-muted">{desc}</p>
                    </div>
                  </label>
                ))}

                {pricing === "paid-sol" && (
                  <div className="mt-1 flex flex-col gap-4 rounded-lg border border-nr-indigoborder bg-nr-indigobg p-4">

                    <div>
                      <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                        Price in SOL <span className="text-nr-red">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={priceSol}
                          onChange={(e) => { setPriceSol(e.target.value); setErrors((p) => ({ ...p, priceSol: undefined })); }}
                          placeholder="0.05"
                          className={`w-36 rounded-lg border bg-white px-4 py-2.5 font-sans text-sm text-nr-ink outline-none transition-colors focus:ring-2 ${errors.priceSol ? "border-nr-red focus:border-nr-red focus:ring-nr-red/10" : "border-nr-border focus:border-nr-red focus:ring-nr-red/10"}`}
                        />
                        <span className="font-sans text-sm font-semibold text-nr-ink">SOL</span>
                      </div>
                      <FieldError msg={errors.priceSol} />
                    </div>

                    <div>
                      <label className="block font-sans text-xs font-semibold uppercase tracking-wide text-nr-muted mb-1.5">
                        Your payout wallet <span className="text-nr-red">*</span>
                      </label>

                      {publicKey ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                            <span className="font-mono text-xs text-nr-ink break-all">{publicKey.toBase58()}</span>
                          </div>
                          <p className="font-sans text-xs text-nr-faint">
                            Auto-filled from your connected wallet. Players&apos; payments will go here.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-sans text-xs text-amber-800">
                            Connect a Solana wallet to auto-fill your payout address, or enter it manually below.
                          </div>
                          <WalletMultiButton />
                          <input
                            type="text"
                            value={payoutWallet}
                            onChange={(e) => { setPayoutWallet(e.target.value); setErrors((p) => ({ ...p, payoutWallet: undefined })); }}
                            placeholder="Your Solana wallet address (base58)"
                            className={`w-full rounded-lg border bg-white px-4 py-2.5 font-mono text-xs text-nr-ink outline-none transition-colors focus:ring-2 ${errors.payoutWallet ? "border-nr-red focus:border-nr-red focus:ring-nr-red/10" : "border-nr-border focus:border-nr-red focus:ring-nr-red/10"}`}
                          />
                        </div>
                      )}
                      <FieldError msg={errors.payoutWallet} />
                    </div>
                  </div>
                )}
              </div>
            </fieldset>

            {/* ── Submit ──────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 rounded-xl border border-nr-border bg-white p-5 shadow-card">
              {publishError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-sans text-xs text-red-700">
                  <strong>Could not publish:</strong> {publishError}
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-sans text-xs text-nr-muted">
                  By publishing you agree to the Novarite{" "}
                  <a href="#" className="text-nr-red underline underline-offset-2">Terms of Service</a>.
                </p>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-lg bg-nr-red px-7 py-2.5 font-sans text-sm font-semibold text-white shadow-sm hover:bg-nr-redhover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving…" : "Publish game"}
                  </button>
                </div>
              </div>
            </div>

          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
