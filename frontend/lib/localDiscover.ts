/**
 * Novarite AI Discovery — Client-side fallback matching.
 *
 * Runs entirely in the browser without any server or model.
 * Used by /ai-discovery when NEXT_PUBLIC_QVAC_API_URL is not set
 * or the local QVAC server is unreachable.
 *
 * The real QVAC semantic engine lives in qvac/recommend.mjs.
 * Run it with: node qvac/game-discovery.mjs "your query here"
 */

import { GAMES, type Game } from "./gameData";

export interface Recommendation {
  id:                string;
  title:             string;
  genre:             string;
  tags:              string[];
  description:       string;
  score:             number;
  reason:            string;
  novariteAvailable: boolean;
  novariteNote:      string;
}

function buildReason(game: Game, query: string): string {
  const q = query.toLowerCase();
  const matched = game.tags.filter((t) => q.includes(t));
  if (matched.length > 0) return `Matched on: ${matched.join(", ")}`;
  return `${game.genre} — ${game.tags.slice(0, 3).join(", ")}`;
}

export function localRecommend(query: string, topN = 5): Recommendation[] {
  const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);

  const scored = GAMES.map((game) => {
    const gameText =
      `${game.title} ${game.genre} ${game.tags.join(" ")} ${game.description}`.toLowerCase();

    let overlap = 0;
    for (const word of words) {
      if (gameText.includes(word)) overlap++;
    }
    const tagBonus =
      game.tags.filter((t) => query.toLowerCase().includes(t)).length * 0.15;
    // Novarite games get a small boost so they surface when relevant
    const novariteBonus = game.novariteAvailable ? 0.05 : 0;
    const score = Math.min(
      (overlap / Math.max(words.length, 1)) * 0.7 + tagBonus + novariteBonus,
      1.0
    );

    return {
      id:                game.id,
      title:             game.title,
      genre:             game.genre,
      tags:              game.tags,
      description:       game.description,
      score:             parseFloat(score.toFixed(4)),
      reason:            buildReason(game, query),
      novariteAvailable: game.novariteAvailable,
      novariteNote:      game.novariteNote,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}
