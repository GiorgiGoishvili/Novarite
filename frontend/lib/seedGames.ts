// Demo game seed — runs once per browser session (tracked by SEED_KEY).
// To force a full re-seed on all browsers, bump SEED_KEY.
import { saveGame, getPublishedGames, type GameListing } from "./games";

// ── Version keys ───────────────────────────────────────────────────────────
// IMPORTANT: the SEED_KEY guard must be the first check in seedDemoGamesIfNeeded.
// Any purge/cleanup that runs before the guard will delete the seeded games on
// every subsequent page load, making them disappear.
const SEED_KEY  = "nr_seeded_v8";  // v7 had a bug: purge ran before guard → bump
const PURGE_KEY = "nr_purge_v3";

const LITTLE_RUNMO_DOWNLOAD_URL =
  "https://drive.google.com/uc?export=download&id=1aiq4ixV9Vjk1-8z_cMybDnOOzYNQTqLw";

const GRAVERUSH_DOWNLOAD_URL = "/downloads/GraveRush.zip";

const LITTLE_RUNMO_DEV_WALLET = "G6gx2shaDWBuzZMDXUPohAHZvbNkckGmV7jPDvAtGWR6";

const GRAVERUSH_COVER    = "/images/games/graverush-cover.png";
const LITTLE_RUNMO_COVER = "/images/games/little-runmo-cover.png";

// Titles to purge from old seeds before writing new ones.
// Safe to list the current demo games here because this purge only runs
// when SEED_KEY has NOT been set yet (i.e. first load for this version).
const STALE_TITLES = new Set([
  "Novastrike",
  "Space guy",
  "Space Guy",
  "Little Runmo - The Game",
  "GraveRush",
]);

// Runs at most once per PURGE_KEY version — cleans up very old localStorage state.
function purgeStaleDemoGames(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(PURGE_KEY)) return;
  try {
    const raw = localStorage.getItem("nr_games");
    if (raw) {
      const games = JSON.parse(raw) as { title?: string }[];
      const cleaned = games.filter((g) => !STALE_TITLES.has(g.title ?? ""));
      localStorage.setItem("nr_games", JSON.stringify(cleaned));
    }
  } catch {
    // Corrupt data — ignored
  }
  localStorage.setItem(PURGE_KEY, "1");
}

function seedIfMissing(
  title: string,
  data: Omit<GameListing, "id" | "createdAt">,
): void {
  if (!getPublishedGames().some((g) => g.title === title)) {
    saveGame(data);
  }
}

export function seedDemoGamesIfNeeded(): void {
  if (typeof window === "undefined") return;

  // ── GUARD: must be first ───────────────────────────────────────────────
  // Do nothing if already seeded for this version.
  // Everything below this line only runs on the very first call per browser.
  if (localStorage.getItem(SEED_KEY)) return;

  // ── One-time cleanup of old localStorage data ──────────────────────────
  purgeStaleDemoGames();

  // Remove stale copies of the demo games so we write fresh ones below.
  try {
    const raw = localStorage.getItem("nr_games");
    if (raw) {
      const games = JSON.parse(raw) as { title?: string }[];
      const cleaned = games.filter((g) => !STALE_TITLES.has(g.title ?? ""));
      localStorage.setItem("nr_games", JSON.stringify(cleaned));
    }
  } catch {
    // Ignore corrupt data
  }

  // ── Little Runmo — paid, 0.005 SOL ────────────────────────────────────
  seedIfMissing("Little Runmo - The Game", {
    title:             "Little Runmo - The Game",
    shortDesc:         "A fan-made adventure through the world of Little Runmo. Explore, platform, and discover secrets. Buy once, keep forever.",
    fullDesc:          "Step into the strange and charming world of Little Runmo — a fan-made adventure inspired by Joel Haver's beloved animated series.\n\nPlatform across colourful environments, uncover hidden secrets, and experience the unsettling humour that made Little Runmo a cult favourite.\n\nPurchase once with Solana devnet and download for Windows. Payment is instant and goes directly to the developer.\n\nNote: This is a fan-made tribute, not an official release. All original characters belong to Joel Haver.",
    engine:            "Custom engine",
    genre:             "Adventure",
    tags:              ["platformer", "adventure", "fan-game", "windows", "short"],
    gameStatus:        "demo",
    buildTypes:        ["win"],
    platform:          "Windows",
    downloadUrl:       LITTLE_RUNMO_DOWNLOAD_URL,
    fileSizeLabel:     "",
    version:           "1.0",
    pricing:           "paid-sol",
    priceSol:          0.005,
    developerWallet:   LITTLE_RUNMO_DEV_WALLET,
    developerUsername: "Novarite Team",
    externalPlayUrl:   "",
    trailerUrl:        "",
    coverImageUrl:     LITTLE_RUNMO_COVER,
    screenshotUrls:    [],
    visibility:        "published",
  });

  // ── GraveRush — free download ──────────────────────────────────────────
  seedIfMissing("GraveRush", {
    title:             "GraveRush",
    shortDesc:         "Survive wave after wave of the undead in this fast-paced FPS. How long can you last? Free download for Windows.",
    fullDesc:          "GraveRush throws you into a graveyard overrun by the undead. Arm yourself, hold your ground, and fight through escalating zombie waves as the night grows darker and the dead grow stronger.\n\nFast movement, responsive shooting, and relentless pressure — GraveRush is built for players who want a straightforward, high-intensity survival challenge.\n\nFree to download and play. No install required — just unzip and run.\n\nCredits: Base project (DeadaysProject) by OknoDev, released under the MIT licence. Novarite integration and modifications by Giorgi Goishvili.",
    engine:            "Godot",
    genre:             "FPS",
    tags:              ["fps", "zombie", "survival", "wave-based", "godot", "free", "windows"],
    gameStatus:        "demo",
    buildTypes:        ["win"],
    platform:          "Windows",
    downloadUrl:       GRAVERUSH_DOWNLOAD_URL,
    fileSizeLabel:     "58 MB",
    version:           "0.7",
    pricing:           "free",
    priceSol:          0,
    developerWallet:   "",
    developerUsername: "Giorgi Goishvili",
    externalPlayUrl:   "",
    trailerUrl:        "",
    coverImageUrl:     GRAVERUSH_COVER,
    screenshotUrls:    [],
    visibility:        "published",
  });

  localStorage.setItem(SEED_KEY, "1");
}
