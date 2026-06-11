# @stoa/examples

Runnable, single-purpose examples for each Stoa skill.

| Script | Command | Needs |
|--------|---------|-------|
| Register identity | `pnpm --filter @stoa/examples identity` | `STOA_PRIVATE_KEY`, `STOA_REGISTRY_ADDRESS` |
| Monetize & pay (x402) | `pnpm --filter @stoa/examples monetize` | two keys, `X402_FACILITATOR_URL`, `@x402/*` + express |
| Escrow job | `pnpm --filter @stoa/examples escrow` | `MERCATOR_BUYER_KEY`, `STOA_ESCROW_ADDRESS`, `WORKER_ADDRESS` |
| Treasury guard | `pnpm --filter @stoa/examples guard` | `STOA_PRIVATE_KEY` |

All scripts read their config from environment variables (see the header of each file).
Copy `../../.env.example` to `.env` and fill in testnet values first.
