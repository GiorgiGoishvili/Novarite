export interface MockGame {
  id: string;
  slug: string;
  title: string;
  developer: string;
  engine: string;
  genre: string;
  tags: string[];
  description: string;
  price: number;        // 0 = free
  players: number;
  rating: number;
  coverColor: string;   // primary color for the cover gradient
  coverEmoji: string;   // decorative icon shown on the card
  badge?: "Demo" | "Free" | "Prototype" | "Released" | "Hot" | "New";
  playInBrowser: boolean;
}

export const mockGames: MockGame[] = [
  {
    id: "1",
    slug: "pixel-hop",
    title: "Pixel Hop Adventure",
    developer: "SoloPixel Studio",
    engine: "HTML5",
    genre: "Platformer",
    tags: ["platformer", "pixel art", "jam"],
    description:
      "A tight little platformer made for a 48-hour jam. Jump through 20 handcrafted levels with a lovable pixel frog.",
    price: 0,
    players: 4280,
    rating: 4.5,
    coverColor: "#60A5FA",
    coverEmoji: "🐸",
    badge: "Free",
    playInBrowser: true,
  },
  {
    id: "2",
    slug: "meadow-keeper",
    title: "Meadow Keeper",
    developer: "TinyByte Games",
    engine: "Godot",
    genre: "Farming / Sim",
    tags: ["farming", "relaxing", "cozy"],
    description:
      "Tend your garden, raise animals, and build a cozy life in this wholesome farming prototype. Calm and satisfying.",
    price: 0,
    players: 8140,
    rating: 4.8,
    coverColor: "#4ADE80",
    coverEmoji: "🌻",
    badge: "Free",
    playInBrowser: false,
  },
  {
    id: "3",
    slug: "empty-house",
    title: "Empty House",
    developer: "OneDevJam",
    engine: "Unreal",
    genre: "Horror",
    tags: ["horror", "walking sim", "atmospheric"],
    description:
      "You arrive at your childhood home. Something is wrong. A short horror walking sim made over one weekend.",
    price: 0,
    players: 2910,
    rating: 4.6,
    coverColor: "#A78BFA",
    coverEmoji: "🏚️",
    badge: "Demo",
    playInBrowser: false,
  },
  {
    id: "4",
    slug: "circuit-rush",
    title: "Circuit Rush",
    developer: "GridMind Games",
    engine: "Unity",
    genre: "Puzzle",
    tags: ["puzzle", "logic", "browser"],
    description:
      "Route electricity through a grid of wires before the timer runs out. 60 hand-designed levels, plays in browser.",
    price: 0,
    players: 11200,
    rating: 4.7,
    coverColor: "#FBBF24",
    coverEmoji: "⚡",
    badge: "Free",
    playInBrowser: true,
  },
  {
    id: "5",
    slug: "cave-crawler-64",
    title: "Cave Crawler 64",
    developer: "RetroForge",
    engine: "GameMaker",
    genre: "Platformer",
    tags: ["retro", "platformer", "downloadable"],
    description:
      "A love letter to the N64 era. Explore sprawling cave dungeons with a chunky low-poly aesthetic and tight controls.",
    price: 2.99,
    players: 1760,
    rating: 4.9,
    coverColor: "#F97316",
    coverEmoji: "⛏️",
    badge: "Hot",
    playInBrowser: false,
  },
  {
    id: "6",
    slug: "forgotten-temple",
    title: "Forgotten Temple",
    developer: "SoloForge",
    engine: "Godot",
    genre: "Adventure",
    tags: ["adventure", "exploration", "prototype"],
    description:
      "An early prototype of an exploration adventure set in a procedurally generated ancient temple. Updated weekly.",
    price: 0,
    players: 980,
    rating: 4.3,
    coverColor: "#EC4899",
    coverEmoji: "🏛️",
    badge: "Prototype",
    playInBrowser: false,
  },
];
