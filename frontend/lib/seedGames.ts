// Demo game seed — runs once per browser session (tracked by SEED_KEY).
// To re-seed after changing the download URL, clear localStorage or bump SEED_KEY.
import { saveGame, getPublishedGames } from "./games";

const SEED_KEY   = "nr_seeded_v3";   // bumped from v2 → triggers fresh seed on all browsers
const PURGE_KEY  = "nr_purge_v1";    // one-time purge of stale demo games from earlier sessions

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Paste your Google Drive (or other) direct download link below.
//
// Google Drive steps:
//   1. Upload the .exe to Google Drive.
//   2. Right-click → Share → "Anyone with the link" (Viewer).
//   3. Copy the share link (looks like: https://drive.google.com/file/d/FILE_ID/view)
//   4. Replace the URL below with:
//        https://drive.google.com/uc?export=download&id=FILE_ID
//
// Note: For files over ~100 MB Google Drive shows a virus-scan warning page.
// In that case you can link to the standard share URL and instruct players
// to click "Download anyway" — or use Supabase Storage for a cleaner UX.
// ─────────────────────────────────────────────────────────────────────────────
const LITTLE_RUNMO_DOWNLOAD_URL =
  "https://drive.google.com/uc?export=download&id=1aiq4ixV9Vjk1-8z_cMybDnOOzYNQTqLw";

// Titles that were added by earlier experiments and should no longer appear.
const STALE_TITLES = new Set([
  "Novastrike",
  "Space guy",
  "Space Guy",
]);

// Remove any stale demo entries from nr_games that were written by older sessions.
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
    // Corrupt data — leave it alone; the seed step below will handle an empty catalogue.
  }

  localStorage.setItem(PURGE_KEY, "1");
}

export function seedDemoGamesIfNeeded(): void {
  if (typeof window === "undefined") return;

  // Always run the purge first so stale games are removed before we check counts.
  purgeStaleDemoGames();

  if (localStorage.getItem(SEED_KEY)) return; // already seeded this version

  // Only seed if the library is empty — don't overwrite real developer uploads.
  if (getPublishedGames().length === 0) {
    saveGame({
      title:             "Little Runmo - The Game",
      shortDesc:         "A charming downloadable adventure. Run the EXE on Windows to play this demo.",
      fullDesc:          "Little Runmo - The Game is a Windows demo used to showcase Novarite's game publishing and download flow. Download the EXE, run it on Windows, and explore the world of Little Runmo.",
      engine:            "Custom engine",
      genre:             "Adventure",
      tags:              ["platformer", "adventure", "demo", "windows"],
      gameStatus:        "demo",
      buildTypes:        ["win"],
      platform:          "Windows",
      downloadUrl:       LITTLE_RUNMO_DOWNLOAD_URL,
      fileSizeLabel:     "",
      version:           "1.0",
      pricing:           "free",
      priceSol:          0,
      developerWallet:   "",
      developerUsername: "Novarite Demo",
      externalPlayUrl:   "",
      trailerUrl:        "",
      visibility:        "published",
    });
  }

  localStorage.setItem(SEED_KEY, "1");
}
