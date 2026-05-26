// Hybrid review system:
// - SEEDED_REVIEWS: hardcoded demo reviews (always visible, never stored anywhere)
// - localStorage "nr_reviews": user-submitted reviews for this browser session
//
// getReviews(slug) merges both. Clear "nr_reviews" to reset user reviews only;
// seeded reviews always reappear on every load.

export interface GameReview {
  id:          string;
  gameSlug:    string;
  username:    string;
  rating:      number;   // 1–5
  recommended: boolean;
  comment:     string;
  createdAt:   string;   // ISO 8601
  seeded?:     true;     // present only on hardcoded demo reviews
}

export interface RatingSummary {
  avg:   number; // rounded to 1 decimal place
  count: number;
}

// ── Slug helper ───────────────────────────────────────────────────────────────
// Derives a stable, URL-safe key from a game title.
//   "Little Runmo - The Game" → "little-runmo-the-game"
//   "GraveRush"               → "graverush"

export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Seeded demo reviews ───────────────────────────────────────────────────────
// Hardcoded — always appear regardless of localStorage state.

const SEEDED_REVIEWS: Record<string, GameReview[]> = {
  "little-runmo-the-game": [
    {
      id:          "seed-lr-1",
      gameSlug:    "little-runmo-the-game",
      username:    "Nika",
      rating:      5,
      recommended: true,
      comment:     "Fun platforming and a clean store page. The game looks easy to understand and the download flow feels smooth.",
      createdAt:   "2025-05-10T10:22:00Z",
      seeded:      true,
    },
    {
      id:          "seed-lr-2",
      gameSlug:    "little-runmo-the-game",
      username:    "Mariam",
      rating:      4,
      recommended: true,
      comment:     "Nice indie demo. I would like to see more screenshots before buying, but the page feels professional.",
      createdAt:   "2025-05-12T14:05:00Z",
      seeded:      true,
    },
    {
      id:          "seed-lr-3",
      gameSlug:    "little-runmo-the-game",
      username:    "Luka",
      rating:      4,
      recommended: true,
      comment:     "The cover, tags, and price make the game feel like a real marketplace listing.",
      createdAt:   "2025-05-14T09:30:00Z",
      seeded:      true,
    },
  ],
  "graverush": [
    {
      id:          "seed-gr-1",
      gameSlug:    "graverush",
      username:    "Giorgi",
      rating:      4,
      recommended: true,
      comment:     "The zombie survival concept is clear and the cover image makes it much more attractive.",
      createdAt:   "2025-05-11T11:00:00Z",
      seeded:      true,
    },
    {
      id:          "seed-gr-2",
      gameSlug:    "graverush",
      username:    "Saba",
      rating:      3,
      recommended: true,
      comment:     "Good prototype idea, but it needs more gameplay screenshots and polish.",
      createdAt:   "2025-05-13T16:45:00Z",
      seeded:      true,
    },
    {
      id:          "seed-gr-3",
      gameSlug:    "graverush",
      username:    "Ana",
      rating:      4,
      recommended: true,
      comment:     "The free download option is clear and the game page feels easy to use.",
      createdAt:   "2025-05-15T08:20:00Z",
      seeded:      true,
    },
  ],
};

// ── localStorage helpers ──────────────────────────────────────────────────────

export const REVIEWS_STORAGE_KEY = "nr_reviews";

function readFromStorage(): GameReview[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      localStorage.getItem(REVIEWS_STORAGE_KEY) ?? "[]"
    ) as GameReview[];
  } catch {
    return [];
  }
}

function writeToStorage(reviews: GameReview[]): void {
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns seeded reviews + any user-submitted reviews for this game slug. */
export function getReviews(gameSlug: string): GameReview[] {
  const seeded = SEEDED_REVIEWS[gameSlug] ?? [];
  const stored = readFromStorage().filter((r) => r.gameSlug === gameSlug);
  return [...seeded, ...stored];
}

/** Appends a new review to localStorage and returns the saved record. */
export function saveReview(
  data: Omit<GameReview, "id" | "createdAt" | "seeded">
): GameReview {
  const review: GameReview = {
    ...data,
    id:        `review_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const all = readFromStorage();
  all.push(review);
  writeToStorage(all);
  return review;
}

/** Returns true if this username has already submitted a review via localStorage.
 *  Seeded reviews do NOT count — they should not block real users from reviewing. */
export function hasReviewed(username: string, gameSlug: string): boolean {
  return readFromStorage().some(
    (r) => r.username === username && r.gameSlug === gameSlug
  );
}

/** Calculates average rating and total count across the given review array. */
export function getRatingSummary(reviews: GameReview[]): RatingSummary {
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    avg:   Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}
