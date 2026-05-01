// MVP: game listings stored in browser localStorage.
// This is per-device and resets on localStorage clear.
// Replace with a database in production.

export interface GameListing {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  engine: string;
  genre: string;
  tags: string[];
  gameStatus: "prototype" | "demo" | "early-access" | "released";
  buildTypes: string[];
  pricing: "free" | "paid-sol";
  priceSol: number;         // 0 for free games
  developerWallet: string;  // Solana public key — receives payment for paid games
  developerUsername: string;
  externalPlayUrl: string;
  trailerUrl: string;
  visibility: "published" | "draft";
  createdAt: string;        // ISO 8601
}

const STORAGE_KEY = "nr_games";

function read(): GameListing[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as GameListing[];
  } catch {
    return [];
  }
}

function write(games: GameListing[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function saveGame(
  data: Omit<GameListing, "id" | "createdAt">
): GameListing {
  const game: GameListing = {
    ...data,
    id: `game_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const all = read();
  all.push(game);
  write(all);
  return game;
}

export function getGames(): GameListing[] {
  return read();
}

export function getPublishedGames(): GameListing[] {
  return read().filter((g) => g.visibility === "published");
}

export function getGameById(id: string): GameListing | null {
  return read().find((g) => g.id === id) ?? null;
}

export function getDeveloperGames(username: string): GameListing[] {
  return read().filter((g) => g.developerUsername === username);
}
