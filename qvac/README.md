# Novarite × QVAC — AI Game Discovery

Novarite's QVAC-powered local AI discovery engine. Players describe what they
want to play in natural language, and Novarite matches the request against indie
game metadata using on-device semantic embeddings.

---

## Tether QVAC Side-Track Summary

Novarite integrates the **QVAC SDK** as its core game discovery engine. QVAC
embeddings run locally and on-device to match player intent against indie game
metadata using cosine similarity over GTE-Large FP16 vector representations.

This directly addresses one of Novarite's central product problems: **small indie
games are hard to find**, and players often do not know exact tags or genres.
QVAC allows natural-language discovery while preserving user privacy — no search
query is ever sent to a centralized AI service.

Key properties:
- **Meaningful integration** — discovery is a core platform feature, not a demo bolt-on
- **Local/on-device** — model runs via QVAC runtime, no cloud inference
- **Private** — zero user queries leave the machine
- **Offline-capable** — works with no internet after the first model download

---

## What the QVAC integration does

`game-discovery.mjs` accepts a plain-English query like:

> _"I want a dark difficult platformer with exploration and combat"_

It:
1. Loads **GTE-Large FP16** via the QVAC local runtime
2. Embeds each game's title, genre, tags, and description into a vector
3. Embeds the player's query into the same vector space
4. Ranks games by **cosine similarity** to the query vector
5. Returns ranked recommendations with score, matched tags, and a blurb

`server.mjs` wraps the same engine in an HTTP server so the frontend can call
real QVAC embeddings when running locally.

---

## File structure

```
qvac/
├── game-data.mjs       # Shared game catalogue + text utilities
├── recommend.mjs       # Core engine: QVAC first, fallback on failure
├── game-discovery.mjs  # CLI entry point
├── server.mjs          # Local HTTP API server  (POST /recommend)
└── README.md           # This file
```

The frontend mirror lives in:
```
frontend/lib/gameData.ts       # TypeScript game catalogue
frontend/lib/localDiscover.ts  # Browser-side fallback matching
frontend/app/ai-discovery/     # /ai-discovery page
```

---

## Prerequisites

- **Node.js ≥ 22.17** (required by QVAC runtime)
- `@qvac/sdk` installed — run `npm install` in the repo root

---

## How to run

### CLI (real QVAC embeddings)

```bash
node qvac/game-discovery.mjs
node qvac/game-discovery.mjs "cozy relaxing game with crafting"
node qvac/game-discovery.mjs "dark difficult platformer with exploration and combat"
node qvac/game-discovery.mjs "short scary horror game"
node qvac/game-discovery.mjs "turn-based pixel RPG"
```

### Local API server

```bash
node qvac/server.mjs
# Server starts at http://localhost:4000

# Test with curl:
curl -X POST http://localhost:4000/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "cozy relaxing game with crafting"}'
```

To connect the frontend to the local QVAC server, add to `frontend/.env.local`:
```
NEXT_PUBLIC_QVAC_API_URL=http://localhost:4000
```

---

## Expected output

```
Novarite Game Discovery — powered by QVAC (local)

Query: "cozy relaxing game with crafting"

Top 5 recommendations  [QVAC local embeddings (GTE-Large FP16)]

  1. Verdant Hollow  (Farming Sim)
     86.5% match
     Why   : Matched on: cozy, relaxing, crafting
     Blurb : Restore an overgrown farm in a sleepy valley. Plant crops, befriend…

  2. Prism Shift  (Puzzle)
     79.7% match
     Why   : Matched on: relaxing
     Blurb : Minimalist color-refraction puzzles. Redirect beams of light through…
  ...
```

---

## How embeddings work

Each game's text representation is built as:

```
"Verdant Hollow — Farming Sim. Tags: cozy, relaxing, crafting, nature, story, multiplayer.
 Restore an overgrown farm in a sleepy valley. Plant crops, befriend villagers…"
```

This is passed to the GTE-Large model which returns a 1024-dimensional float
vector. The player's query is embedded the same way. Cosine similarity
(dot product / product of L2 norms) ranks the games. Scores near 1.0 mean the
query and the game description are semantically close.

---

## Why local / private / offline?

| Property | Benefit |
|---|---|
| **No API key** | Works out of the box after `npm install @qvac/sdk` |
| **No network call** | Queries and game text are processed entirely on-device |
| **No rate limit** | Discovery scales to any catalogue size |
| **Works offline** | After the one-time model download, no internet needed |
| **User privacy** | Search behaviour is never logged by a third party |

---

## Fallback mode

If `@qvac/sdk` cannot be imported or the model fails to load, `recommend.mjs`
automatically falls back to lightweight word + tag overlap matching and prints:

```
Fallback mode: QVAC SDK is not available or model loading failed.
Real QVAC integration code is preserved.
```

The fallback is **not** the main feature — it only protects the demo from
crashing in environments without the QVAC runtime.

---

## Troubleshooting

### `EIDLETIMEOUT` during `npm install`

The npm registry connection timed out. Fix:

```bash
# Clear any partial install first, then retry with higher timeout
Remove-Item -Recurse -Force node_modules\@qvac -ErrorAction SilentlyContinue
npm install @qvac/sdk --fetch-timeout=120000
```

### `EPERM: operation not permitted` on Windows

A previous partial install locked the `@qvac\onnx\prebuilds\include` directory.
Fix (PowerShell):

```powershell
Remove-Item -Recurse -Force node_modules\@qvac -ErrorAction SilentlyContinue
npm install @qvac/sdk --fetch-timeout=120000
```

### `RPC_INIT_TIMEOUT` on first run

The QVAC worker process needs extra time to start on the very first invocation.
Run the command again — the model is cached and subsequent runs start instantly.

### First-run model download (~670 MB)

On first run, `game-discovery.mjs` downloads `gte-large_fp16.gguf` to
`C:\Users\<you>\.qvac\models\`. This takes ~1–2 minutes on a typical connection.
All subsequent runs are instant (model is cached locally).

### `[sdk:client] Model type "embeddings" is an alias and will be deprecated`

Already fixed — `modelType` is set to `"llamacpp-embedding"`.

---

## Extending to real Novarite game data

Replace the `GAMES` constant in `qvac/game-data.mjs` with a Supabase query:

```js
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const { data: GAMES } = await supabase
  .from("games")
  .select("id, title, genre, tags, description")
  .eq("is_published", true);
```

For production, pre-compute and cache game embeddings in a vector column to
avoid re-embedding the full catalogue on every query.
