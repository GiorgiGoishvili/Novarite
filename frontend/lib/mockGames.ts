export interface MockGame {
  id: string;
  slug: string;
  title: string;
  studio: string;
  genre: string;
  description: string;
  price: number;
  players: number;
  rating: number;
  coverFrom: string;
  coverTo: string;
  coverSymbol: string;
  badge?: string;
}

export const mockGames: MockGame[] = [
  {
    id: "1",
    slug: "veilborn",
    title: "Veilborn",
    studio: "Ashenwing Interactive",
    genre: "Dark RPG",
    description:
      "A forsaken knight awakens with no memory of his sin. Traverse a crumbling kingdom caught between life and oblivion.",
    price: 0.8,
    players: 2341,
    rating: 4.9,
    coverFrom: "#1a0832",
    coverTo: "#080614",
    coverSymbol: "◆",
    badge: "Featured",
  },
  {
    id: "2",
    slug: "ironvault-protocol",
    title: "Ironvault Protocol",
    studio: "Null Sector Games",
    genre: "Tactical FPS",
    description:
      "A derelict megaship. A crew that never came home. Breach the Ironvault — or become another ghost in its walls.",
    price: 0.5,
    players: 4102,
    rating: 4.7,
    coverFrom: "#0a1828",
    coverTo: "#050e18",
    coverSymbol: "⊞",
    badge: "Hot",
  },
  {
    id: "3",
    slug: "saltmarsh-chronicles",
    title: "Saltmarsh Chronicles",
    studio: "Tidewood Studio",
    genre: "Adventure",
    description:
      "A lone cartographer charts a sea of forgotten islands. Every map tells a story. Every island holds a secret.",
    price: 0.35,
    players: 1560,
    rating: 4.8,
    coverFrom: "#062018",
    coverTo: "#030e0a",
    coverSymbol: "◉",
  },
  {
    id: "4",
    slug: "colossus-engine",
    title: "Colossus Engine",
    studio: "Brasswork Dev",
    genre: "Strategy",
    description:
      "Build war machines. Command living armies. Own every gear, rivet, and regiment as a verifiable on-chain asset.",
    price: 1.2,
    players: 980,
    rating: 4.6,
    coverFrom: "#201406",
    coverTo: "#0f0804",
    coverSymbol: "⬡",
  },
  {
    id: "5",
    slug: "pale-circuit",
    title: "Pale Circuit",
    studio: "Gridfire Labs",
    genre: "Puzzle",
    description:
      "A neural network became conscious. Now it wants out. Can you trace the path before the next reboot?",
    price: 0.0,
    players: 8200,
    rating: 4.5,
    coverFrom: "#0c0c28",
    coverTo: "#060610",
    coverSymbol: "⟡",
    badge: "Free",
  },
  {
    id: "6",
    slug: "carrion-faith",
    title: "Carrion Faith",
    studio: "Obsidian Chalk",
    genre: "Survival Horror",
    description:
      "Something ancient lives beneath the monastery. The pilgrims didn't come to worship. You're not the first survivor.",
    price: 0.6,
    players: 1230,
    rating: 4.7,
    coverFrom: "#1e0808",
    coverTo: "#0a0404",
    coverSymbol: "✦",
    badge: "New",
  },
];
