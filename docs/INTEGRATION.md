# Integration testing

`scripts/run-integration.sh` proves the skills work against a **real chain** end-to-end. It:

1. builds the Foundry contracts,
2. starts a local **anvil** node,
3. deploys `StoaRegistry`, `StoaEscrow`, `SocialFeed`, and `TipJar` to it via viem (reading the
   Foundry artifacts), and
4. runs the actual skills — `agent_identity`, `agent_escrow`, `reputation`, `social_post`,
   `tip_send`, `tip_stats` — asserting each succeeds on-chain.

```bash
pnpm test:integration
```

## Requirements

- **Foundry with `anvil`** on your PATH (`foundryup` installs `forge`, `cast`, and `anvil`).
- Node ≥ 20 and the workspace installed (`pnpm install`).

The script uses anvil's well-known dev accounts (#0 and #1), so no funded keys or network access
are needed — it runs fully offline.

## What it validates

| Skill | Assertion |
|-------|-----------|
| `agent_identity` | register returns an id; resolve reads it back |
| `agent_escrow` | create locks funds; release pays the worker |
| `reputation` | a counterparty attestation increments the score |
| `social_post` | a post is written and retrievable |
| `tip_send` / `tip_stats` | a tip transfers and shows in stats |

The skill **handler code path is identical** to production against Pharos Atlantic — only the RPC
URL and chain id differ — so a green integration run is strong evidence the skills work on Pharos.
