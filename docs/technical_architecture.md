# Technical Architecture

## Overview

Novarite is planned as a Solana-powered indie game platform with three main layers:

1. Frontend application
2. Solana program
3. Documentation and integration layer

## Frontend

The frontend will provide:

- Public landing page
- Game marketplace
- Creator dashboard
- Wallet connection
- Access pass purchase flow
- Reward claim flow

Planned stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Solana wallet adapter

## Solana Program

The Solana program will manage core ownership logic.

Planned instructions:

- `initialize_platform`
- `register_developer`
- `publish_game`
- `update_game`
- `buy_access_pass`
- `claim_reward`

## Main Accounts

Planned account types:

- `PlatformConfig`
- `DeveloperProfile`
- `GameListing`
- `AccessPass`
- `PlayerReward`

## Data Flow

1. Developer connects wallet.
2. Developer creates a profile.
3. Developer publishes a game listing.
4. Player connects wallet.
5. Player buys or receives access pass.
6. Player claims reward.
7. Frontend displays ownership state.

## Repository Structure

```text
docs/
frontend/
programs/
scripts/
tests/
assets/
