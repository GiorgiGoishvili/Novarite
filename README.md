# Novarite

This repository contains the core prototype for Novarite: a Solana-powered indie game platform focused on developer publishing, game access passes, player rewards, and digital ownership.

This repository's first public commit captures the early hackathon baseline, and later commits will reflect product development, frontend progress, smart contract implementation, and design improvements made during the hackathon.

## Project Repositories

This repository contains the core prototype for Novarite.

- **Novarite Frontend** – Public-facing app, landing page, marketplace, and creator dashboard.
- **Novarite Program** – Solana smart contract for developer profiles, game listings, access passes, and rewards.
- **Novarite Docs** – Product, protocol, and integration documentation.

## Prerequisites

- Node.js 18+
- Rust
- Solana CLI
- Anchor
- Git

## Install

    npm install

## Build

    anchor build

## Test

    anchor test

## Verify

    npm run verify

## Deploy

    npm run deploy:devnet

## Documentation

- [Project Overview](docs/project_overview.md)
- [MVP Scope](docs/mvp_scope.md)
- [Platform Message Schemas](docs/platform-message-schemas.md)
- [Technical Architecture](docs/technichal_architecture.md)
- [Public Messaging](docs/public_messaging.md)

## QVAC Local AI Discovery

Novarite integrates the **QVAC SDK** as a local-first AI discovery engine.
Players describe what they want to play in natural language and Novarite matches
the request against indie game metadata using on-device semantic embeddings
(GTE-Large FP16 via the QVAC runtime).

This solves a real platform problem: small indie games are hard to find, and
players often do not know exact tags or genres. QVAC enables natural-language
discovery while keeping all user queries private — nothing is sent to a cloud AI
service.

**Try it:**

```bash
node qvac/game-discovery.mjs "cozy relaxing game with crafting"
node qvac/game-discovery.mjs "dark difficult platformer with combat"
```

**Start the local API server** (connects to the `/ai-discovery` frontend page):

```bash
node qvac/server.mjs
```

**Customer-facing page:** `/ai-discovery` — describes what you want to play,
shows ranked game cards with match scores and reasons.

See [`qvac/README.md`](qvac/README.md) for full documentation, troubleshooting,
and architecture notes.

## Status

Early hackathon prototype currently under active development.
