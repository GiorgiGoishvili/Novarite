# Novarite Frontend

Next.js 14 + TypeScript + Tailwind CSS landing page for the Novarite indie game platform.

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
- **Tailwind CSS** — dark futuristic design system

## Structure

```
app/
  layout.tsx          Root layout + metadata
  page.tsx            Landing page (assembles all sections)
  globals.css         Tailwind imports + custom utilities

components/
  Header.tsx          Fixed nav + Connect Wallet placeholder
  Hero.tsx            Main headline + CTA
  FeatureGrid.tsx     6-feature card grid
  MarketplacePreview.tsx  Game cards with mock buy flow
  CreatorDashboardPreview.tsx  Mock stats + recent sales table
  Footer.tsx          Links + Colosseum badge

lib/
  mockGames.ts        Typed mock data for 6 games
```

## Wallet integration (future)

The "Connect Wallet" button is a UI placeholder. Full Solana wallet integration
(using `@solana/wallet-adapter-react`) and live on-chain reads are the next step
after the hackathon MVP.
