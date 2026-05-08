/**
 * Novarite × QVAC — AI Game Discovery CLI
 *
 * Runs locally using QVAC GTE-Large FP16 embeddings.
 * No network calls. No API keys. Your query never leaves your machine.
 *
 * Usage:
 *   node qvac/game-discovery.mjs
 *   node qvac/game-discovery.mjs "cozy relaxing game with crafting"
 *   node qvac/game-discovery.mjs "dark difficult platformer with combat"
 */

import { recommend } from "./recommend.mjs";

const query =
  process.argv[2] ?? "I want a dark difficult platformer with exploration and combat";
const TOP_N = 5;

console.log("\nNovarite Game Discovery — powered by QVAC (local)\n");
console.log(`Query: "${query}"\n`);

const { mode, results } = await recommend(query, TOP_N);

const modeLabel =
  mode === "qvac"
    ? "QVAC local embeddings (GTE-Large FP16)"
    : "Fallback text matching (QVAC unavailable)";

console.log(`Top ${results.length} recommendations  [${modeLabel}]\n`);

results.forEach(({ title, genre, score, reason, description }, rank) => {
  const scoreDisplay =
    mode === "qvac" ? `${(score * 100).toFixed(1)}% match` : `score ${score}`;
  console.log(`  ${rank + 1}. ${title}  (${genre})`);
  console.log(`     ${scoreDisplay}`);
  console.log(`     Why   : ${reason}`);
  console.log(`     Blurb : ${description.slice(0, 90)}…\n`);
});
