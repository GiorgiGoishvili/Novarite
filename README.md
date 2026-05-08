# Novarite

**Novarite** is a Solana-powered indie game platform. Developers publish games on-chain; players buy access passes using native SOL and claim in-game rewards.

Built for the QVAC × Solana Hackathon.

---

## What it does

- **Marketplace** — Browse and buy indie games. Free downloads served directly. Paid games require a Phantom or Backpack SOL payment on Solana devnet.
- **Developer publishing** — Developers upload games via `/upload`; listings are stored in Supabase and exposed through the marketplace.
- **AI Game Discovery** — Natural-language search at `/ai-discovery` powered by the QVAC SDK (GTE-Large FP16 embeddings). Describe what you want to play and get ranked recommendations — no exact tags or genre knowledge needed.
- **Solana devnet payments** — The "Buy" button sends a real SOL transaction on devnet via Phantom/Backpack. Ownership is confirmed in localStorage and recorded in Supabase for cross-device persistence.
- **Anchor smart contract** — Full on-chain program with platform config, developer profiles, game listings, access passes, and player rewards.

---

## Solana Program

**Location:** [`programs/novarite/src/lib.rs`](programs/novarite/src/lib.rs)

**Program ID:** `53HE6Bd8xUv55nGbCYGuRtZEvYQNNGioZAGyr9jTEGEe`

**Devnet status:** ✅ **Deployed to Solana devnet.**

| | |
|---|---|
| Program ID | `53HE6Bd8xUv55nGbCYGuRtZEvYQNNGioZAGyr9jTEGEe` |
| Deploy signature | `5Vh4LD6PDSKKSoumHNmHKXHBYgCPQxR6dCKphaJQX9zeaekhKntnhiNP6syrDts19jgGky9WDzJGehH2uNXQeENs` |
| IDL account | `32AkFWzYmgTjXz1NAHSyBf3VwR7L9wAQPuiM5RmWG2Qy` |
| Explorer | [View on Solana Explorer](https://explorer.solana.com/address/53HE6Bd8xUv55nGbCYGuRtZEvYQNNGioZAGyr9jTEGEe?cluster=devnet) |

### Instructions

| Instruction | Description |
|---|---|
| `initialize_platform` | Creates a `PlatformConfig` PDA storing the platform fee in basis points |
| `register_developer` | Creates a `DeveloperProfile` PDA for a wallet |
| `publish_game` | Creates a `GameListing` PDA with title, slug, metadata URI, and price |
| `buy_access_pass` | Transfers SOL to the developer + platform fee; mints an `AccessPass` PDA |
| `claim_reward` | Mints a `PlayerReward` PDA (gated by owning an `AccessPass`) |
| `update_game` | Updates title, metadata URI, or price on an existing `GameListing` |

### Build

```bash
anchor build
```

### Tests

```bash
anchor test
```

Runs 11 integration tests against a local validator covering: fee validation, platform initialization, developer registration, game publishing, access pass purchase (with platform fee deduction), reward claiming, and permission constraints.

---

## Frontend — devnet payment flow

The frontend (`frontend/`) is a Next.js 14 App Router app connecting to `https://api.devnet.solana.com`.

**To test a purchase:**

1. Install [Phantom](https://phantom.app) or [Backpack](https://backpack.app).
2. Switch the wallet to **Devnet**: Phantom → Settings → Developer Settings → Enable Testnet Mode → select Devnet.
3. Get free devnet SOL at [faucet.solana.com](https://faucet.solana.com) or run:
   ```bash
   solana airdrop 1 <your-wallet-address> --url devnet
   ```
   You need at least **0.006 SOL** (0.005 price + ~0.000005 transaction fee).
4. Open the marketplace, click **Buy — 0.005 SOL** on *Little Runmo - The Game*.
5. Approve in your wallet. The button changes to **Download** once the transaction confirms.

> **Note:** The "Buy" button executes a direct `SystemProgram.transfer` — a real devnet SOL transaction — rather than calling the Anchor `buy_access_pass` instruction. The on-chain program is deployed and verified on devnet; routing purchases through it is the next integration step.

---

## Games in the marketplace

| Game | Developer | Price | Platform |
|---|---|---|---|
| **GraveRush** | Giorgi Goishvili | Free | Windows |
| **Little Runmo - The Game** | Novarite Demo | 0.005 SOL (devnet) | Windows |

### GraveRush — attribution

GraveRush is built on [DeadaysProject](https://github.com/oknogmdv/DeadaysProject) by **OknoDev**, used under the MIT License. Novarite integration, cosmetic skin system foundations, and Solana inventory hooks added by **Giorgi Goishvili**.

---

## AI Game Discovery — QVAC

Novarite uses the **QVAC SDK** as its core discovery engine. GTE-Large FP16 embeddings run locally or via a lightweight API server to match player intent against game metadata using cosine similarity.

**CLI:**
```bash
node qvac/game-discovery.mjs "cozy relaxing game with crafting"
node qvac/game-discovery.mjs "dark difficult platformer with combat"
node qvac/game-discovery.mjs "zombie fps with retro visuals"
```

**Local API server** (connects to the `/ai-discovery` page):
```bash
node qvac/server.mjs
# then set NEXT_PUBLIC_QVAC_API_URL=http://localhost:4000 in frontend/.env.local
```

Without a running server the `/ai-discovery` page falls back to browser-side word-overlap matching automatically.

See [`qvac/README.md`](qvac/README.md) for full documentation.

---

## Running locally

**Prerequisites:** Node.js 18+, Rust, Solana CLI, Anchor CLI 0.32.1

```bash
# 1. Clone
git clone https://github.com/GiorgiGoishvili/Novarite
cd Novarite

# 2. Install root dependencies (used by Anchor tests)
npm install

# 3. Install and run the frontend
cd frontend
npm install
npm run dev          # http://localhost:3000
cd ..

# 4. Build the Anchor program
anchor build

# 5. Run Anchor tests (starts a local validator automatically)
anchor test

# 6. (Optional) Start the QVAC discovery API server
node qvac/server.mjs
```

---

## Deployed

> **Live demo:** _URL to be added before submission_

---

## Project structure

```
programs/novarite/     Anchor smart contract (Rust)
frontend/              Next.js 14 App Router — marketplace, uploads, AI discovery
qvac/                  QVAC AI engine — CLI, API server, game catalogue
tests/                 Anchor integration tests (ts-mocha, 11 tests)
supabase/              Supabase migrations and RLS policies
docs/                  Architecture, MVP scope, and product docs
scripts/               Utility scripts
```

---

## Prerequisites

- Node.js 18+
- Rust (latest stable)
- Solana CLI
- Anchor CLI 0.32.1
