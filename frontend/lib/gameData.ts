/**
 * Novarite game catalogue — TypeScript mirror of qvac/game-data.mjs.
 * Used by the AI Discovery page for client-side fallback matching.
 * In production, replace with a live Supabase `games` table query.
 */

export interface Game {
  id: string;
  title: string;
  genre: string;
  tags: string[];
  description: string;
}

export const GAMES: Game[] = [
  {
    id: "abyss-runner",
    title: "Abyss Runner",
    genre: "Platformer",
    tags: ["dark", "difficult", "precision", "exploration", "combat", "underground"],
    description:
      "A punishing precision platformer set in the sunless depths of a collapsed civilization. Fight through decaying ruins, dodge lethal traps, and uncover buried lore in a world that wants you dead.",
  },
  {
    id: "verdant-hollow",
    title: "Verdant Hollow",
    genre: "Farming Sim",
    tags: ["cozy", "relaxing", "crafting", "nature", "story", "multiplayer"],
    description:
      "Restore an overgrown farm in a sleepy valley. Plant crops, befriend villagers, craft tools, and unravel the gentle mystery of why everyone left. Perfect for unwinding.",
  },
  {
    id: "nova-blast",
    title: "Nova Blast",
    genre: "Arcade Shooter",
    tags: ["retro", "fast-paced", "high-score", "space", "bullet-hell", "arcade"],
    description:
      "Old-school twin-stick shooter with neon pixel art. Blast waves of alien drones, chain combos for score multipliers, and compete on the global leaderboard.",
  },
  {
    id: "hollow-signal",
    title: "Hollow Signal",
    genre: "Puzzle Horror",
    tags: ["horror", "atmospheric", "puzzle", "mystery", "dark", "psychological"],
    description:
      "Solve cryptic radio-frequency puzzles in an abandoned research station while something moves in the static. Atmospheric dread, no jump scares.",
  },
  {
    id: "iron-crown",
    title: "Iron Crown",
    genre: "RPG",
    tags: ["pixel-art", "rpg", "turn-based", "exploration", "story", "dark-fantasy"],
    description:
      "A pixel-art dark-fantasy RPG with a branching political story. Build alliances, wage wars, or burn it all down. Every choice reshapes the kingdom's future.",
  },
  {
    id: "prism-shift",
    title: "Prism Shift",
    genre: "Puzzle",
    tags: ["minimalist", "puzzle", "logic", "color", "relaxing", "abstract"],
    description:
      "Minimalist color-refraction puzzles. Redirect beams of light through prisms to unlock each chamber. Clean visuals, meditative pacing, 120 handcrafted levels.",
  },
  {
    id: "ghost-wire",
    title: "Ghost Wire",
    genre: "Stealth Action",
    tags: ["cyberpunk", "stealth", "hacking", "neon", "action", "futuristic"],
    description:
      "Infiltrate megacorp servers as a rogue netrunner in a rain-soaked cyberpunk city. Ghost through guards, rewrite security protocols, and stay off the grid.",
  },
  {
    id: "drift-beyond",
    title: "Drift Beyond",
    genre: "Roguelite",
    tags: ["space", "exploration", "roguelite", "procedural", "sci-fi", "survival"],
    description:
      "Procedurally generated star systems, hull-breach emergencies, and alien artifacts with unknown effects. Each run is a new voyage into the deep dark.",
  },
  {
    id: "ember-keep",
    title: "Ember Keep",
    genre: "Tower Defense",
    tags: ["strategy", "tower-defense", "fantasy", "difficult", "resource-management"],
    description:
      "Defend the last warm fortress against endless undead hordes. Place rune towers, manage ember-fuel resources, and survive the long winter siege.",
  },
  {
    id: "threadbare",
    title: "Threadbare",
    genre: "Narrative Adventure",
    tags: ["narrative", "emotional", "hand-drawn", "mystery", "exploration", "indie"],
    description:
      "A hand-drawn narrative adventure about a seamstress who discovers her stitches can rewrite memories. Explore a town stitched together from forgotten stories.",
  },
];
