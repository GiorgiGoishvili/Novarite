/**
 * Novarite × QVAC — Local API Server
 *
 * Exposes QVAC recommendations over HTTP so the Next.js frontend can call
 * real on-device embeddings when running locally.
 *
 * Usage:
 *   node qvac/server.mjs
 *
 * Then add to frontend/.env.local:
 *   NEXT_PUBLIC_QVAC_API_URL=http://localhost:4000
 *
 * Endpoint:
 *   POST /recommend
 *   Body:    { "query": "cozy relaxing game with crafting" }
 *   Response:{ "mode": "qvac", "recommendations": [...] }
 *
 * CORS is open for localhost development. Do not expose this server publicly.
 */

import { createServer } from "http";
import { recommend } from "./recommend.mjs";

const PORT = Number(process.env.QVAC_PORT ?? 4000);

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body));
}

createServer(async (req, res) => {
  // CORS pre-flight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    return json(res, 200, {
      name: "Novarite QVAC API",
      status: "running",
      usage: {
        endpoint: "POST /recommend",
        body: { query: "cozy relaxing game with crafting" },
      },
    });
  }

  if (req.method === "POST" && req.url === "/recommend") {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", async () => {
      try {
        const { query } = JSON.parse(raw);
        if (typeof query !== "string" || !query.trim()) {
          return json(res, 400, { error: "query (string) is required" });
        }
        const { mode, results } = await recommend(query.trim());
        json(res, 200, { mode, recommendations: results });
      } catch (err) {
        json(res, 500, { error: String(err.message) });
      }
    });
    return;
  }

  json(res, 404, { error: "Not found. POST /recommend" });
}).listen(PORT, () => {
  console.log(`\nNovarite QVAC API server → http://localhost:${PORT}`);
  console.log(`  POST /recommend  { "query": "your natural language query" }\n`);
  console.log(
    `  Add NEXT_PUBLIC_QVAC_API_URL=http://localhost:${PORT} to frontend/.env.local\n`
  );
});
