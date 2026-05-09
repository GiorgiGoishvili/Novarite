# Novarite Frontend

Next.js 14 + TypeScript + Tailwind CSS frontend for the Novarite indie game platform.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js 14** — App Router, React Server Components
- **TypeScript** — strict mode
- **Tailwind CSS** — white/clean design system
- **Supabase** — auth, profiles, game publishing, purchases
- **Solana/Anchor** — on-chain payment flow (devnet)

## Structure

```
app/
  layout.tsx              Root layout + metadata
  page.tsx                Landing page
  upload/page.tsx         Game upload + publishing flow
  profile/page.tsx        User profile page
  ai-discovery/page.tsx   AI Game Discovery (QVAC-powered)
  login/page.tsx          Auth (email + phone)
  api/
    games/published/      Supabase-backed published games API

components/
  Header.tsx              Nav + auth state
  Footer.tsx              Links
  MarketplacePreview.tsx  Live game cards from Supabase
  Hero.tsx                Main headline + CTA
  FeatureGrid.tsx         Feature card grid

context/
  AuthContext.tsx         Supabase auth session
  ProfileContext.tsx      User profile row fetch + fallback

lib/
  gameData.ts             Reference game catalogue (111 games) for AI Discovery
  localDiscover.ts        Browser-side fallback matching for AI Discovery
  seedGames.ts            localStorage seeding + stale-entry purge
  solanaPayment.ts        Solana devnet payment helpers
```
