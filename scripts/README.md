# Scripts

Utility scripts for the Novarite platform.

## Planned scripts

| Script | Purpose |
|---|---|
| `init-platform.ts` | Call `initialize_platform` on devnet |
| `register-dev.ts` | Register a developer profile |
| `publish-game.ts` | Publish a game listing |
| `airdrop-rewards.ts` | Batch-issue `claim_reward` transactions to early players |

These will be added post-hackathon as the platform matures.

## Running a script (future usage)

```bash
ts-node scripts/init-platform.ts
```

Make sure your `~/.config/solana/id.json` wallet is funded with devnet SOL:

```bash
solana airdrop 2 --url devnet
```
