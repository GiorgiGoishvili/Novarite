// Demo game seed — runs once per browser session (tracked by SEED_KEY).
// To re-seed after changing game data, bump SEED_KEY.
import { saveGame, getPublishedGames, type GameListing } from "./games";

const SEED_KEY  = "nr_seeded_v6";  // v5 → v6: new receiver wallet (Backpack G6gx2sha…)
const PURGE_KEY = "nr_purge_v3";   // v2 → v3: force re-purge on all browsers with any stale entry

const LITTLE_RUNMO_DOWNLOAD_URL =
  "https://drive.google.com/uc?export=download&id=1aiq4ixV9Vjk1-8z_cMybDnOOzYNQTqLw";

const GRAVERUSH_DOWNLOAD_URL = "/downloads/GraveRush.zip";

// Backpack wallet that receives 0.005 devnet SOL per Little Runmo purchase.
const LITTLE_RUNMO_DEV_WALLET = "G6gx2shaDWBuzZMDXUPohAHZvbNkckGmV7jPDvAtGWR6";

// Titles that were seeded by earlier experiments and should no longer appear,
// OR titles being re-seeded with updated data (purge + re-seed pattern).
// "Little Runmo - The Game" is listed here to purge the old free version so
// it can be re-seeded as a paid game in this version.
const STALE_TITLES = new Set([
  "Novastrike",
  "Space guy",
  "Space Guy",
  "Little Runmo - The Game",  // re-seeded below as paid-sol
]);

// Remove stale demo entries from nr_games written by older sessions.
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
    // Corrupt data — leave it alone; seed step below handles empty catalogue.
  }

  localStorage.setItem(PURGE_KEY, "1");
}

// Add a demo game only if no game with that exact title exists yet.
function seedIfMissing(title: string, data: Omit<GameListing, "id" | "createdAt">): void {
  if (!getPublishedGames().some((g) => g.title === title)) {
    saveGame(data);
  }
}

export function seedDemoGamesIfNeeded(): void {
  if (typeof window === "undefined") return;

  // Purge runs first so stale entries (including old free Little Runmo) are removed.
  purgeStaleDemoGames();

  if (localStorage.getItem(SEED_KEY)) return;

  // ── Little Runmo — paid, 0.005 SOL ────────────────────────────────────────
  // Pricing: paid-sol. BuyButton handles the full Phantom → devnet transaction →
  // localStorage ownership flow. After purchase the Download button appears.
  seedIfMissing("Little Runmo - The Game", {
    title:             "Little Runmo - The Game",
    shortDesc:         "A charming downloadable adventure for Windows. Buy with 0.005 devnet SOL.",
    fullDesc:          "Little Runmo - The Game is a Windows download showcasing Novarite's Solana-powered game purchasing flow. Buy with 0.005 devnet SOL via Phantom, then download the EXE and explore the world of Little Runmo.",
    engine:            "Custom engine",
    genre:             "Adventure",
    tags:              ["platformer", "adventure", "demo", "windows"],
    gameStatus:        "demo",
    buildTypes:        ["win"],
    platform:          "Windows",
    downloadUrl:       LITTLE_RUNMO_DOWNLOAD_URL,
    fileSizeLabel:     "",
    version:           "1.0",
    pricing:           "paid-sol",
    priceSol:          0.005,
    developerWallet:   LITTLE_RUNMO_DEV_WALLET,
    developerUsername: "Novarite Demo",
    externalPlayUrl:   "",
    trailerUrl:        "",
    visibility:        "published",
  });

  // ── GraveRush — free download ───────────────────────────────────────────────
  seedIfMissing("GraveRush", {
    title:             "GraveRush",
    shortDesc:         "Wave-based zombie survival FPS for Windows. Free download. Base project by OknoDev · Novarite integration by Giorgi Goishvili.",
    fullDesc:          "GraveRush is a downloadable wave-based zombie survival FPS built on DeadaysProject by OknoDev (used with permission, MIT License). The Novarite version adds cosmetic skin foundations and future Solana-powered inventory integration.\n\nCredits:\n- Original base project: DeadaysProject by OknoDev\n- Novarite integration and modifications: Giorgi Goishvili",
    engine:            "Godot",
    genre:             "FPS",
    tags:              ["fps", "zombie", "survival", "wave-based", "godot", "downloadable", "cosmetics", "solana"],
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
    visibility:        "published",
  });

  localStorage.setItem(SEED_KEY, "1");
}
