/**
 * Novarite × QVAC — Core recommendation engine.
 *
 * Tries QVAC embeddings (GTE-Large FP16) first.
 * Falls back to lightweight word/tag matching if the SDK is unavailable
 * or model loading fails — so the CLI and API server always return results.
 *
 * Exports:
 *   recommend(query, topN?) → Promise<{ mode: "qvac" | "fallback", results: Result[] }>
 *
 * Result shape:
 *   { id, title, genre, tags, description, score, reason }
 */

import { GAMES, gameToText, cosineSimilarity, buildReason } from "./game-data.mjs";

// ─────────────────────────────────────────────────────────────────────────────
// Fallback: token + tag overlap scoring (no model required)
// ─────────────────────────────────────────────────────────────────────────────
function fallbackRecommend(query, topN) {
  console.warn(
    "\nFallback mode: QVAC SDK is not available or model loading failed. Real QVAC integration code is preserved.\n"
  );

  // Tokenize query — skip stop-words shorter than 3 chars
  const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);

  const scored = GAMES.map((game) => {
    const gameText = gameToText(game).toLowerCase();
    let overlap = 0;
    for (const w of words) {
      if (gameText.includes(w)) overlap++;
    }
    // Exact tag matches get an extra 0.15 bonus each
    const tagBonus =
      game.tags.filter((t) => query.toLowerCase().includes(t)).length * 0.15;
    const score = Math.min(
      (overlap / Math.max(words.length, 1)) * 0.7 + tagBonus,
      1.0
    );
    return {
      id: game.id,
      title: game.title,
      genre: game.genre,
      tags: game.tags,
      description: game.description,
      score: parseFloat(score.toFixed(4)),
      reason: buildReason(game, query),
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}

// ─────────────────────────────────────────────────────────────────────────────
// Primary path: QVAC GTE-Large FP16 semantic embeddings
// ─────────────────────────────────────────────────────────────────────────────
export async function recommend(query, topN = 5) {
  // Dynamic import so failures don't crash callers that only need fallback
  let sdk;
  try {
    sdk = await import("@qvac/sdk");
  } catch {
    return { mode: "fallback", results: fallbackRecommend(query, topN) };
  }

  const { embed, GTE_LARGE_FP16, loadModel, unloadModel } = sdk;
  let modelId;

  try {
    console.log("Loading QVAC embedding model (GTE-Large FP16)…");
    modelId = await loadModel({
      modelSrc: GTE_LARGE_FP16,
      modelType: "llamacpp-embedding",
      onProgress: ({ progress, total }) => {
        if (total)
          process.stdout.write(
            `\r  Downloading: ${Math.round((progress / total) * 100)}%`
          );
      },
    });
    console.log("\nModel ready.\n");

    // Batch-embed all game texts + the query in two calls
    const gameTexts = GAMES.map(gameToText);
    const { embedding: gameEmbeddings } = await embed({ modelId, text: gameTexts });
    const { embedding: queryEmbedding } = await embed({ modelId, text: query });

    const results = GAMES.map((game, i) => ({
      id: game.id,
      title: game.title,
      genre: game.genre,
      tags: game.tags,
      description: game.description,
      score: parseFloat(
        cosineSimilarity(queryEmbedding, gameEmbeddings[i]).toFixed(4)
      ),
      reason: buildReason(game, query),
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    await unloadModel({ modelId });
    return { mode: "qvac", results };
  } catch (err) {
    // Clean up model if partially loaded
    if (modelId) {
      try { await unloadModel({ modelId }); } catch { /* ignore */ }
    }
    console.warn(`\nQVAC model error: ${err.message}`);
    return { mode: "fallback", results: fallbackRecommend(query, topN) };
  }
}
