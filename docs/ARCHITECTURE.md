# Architecture

Stoa is a layered monorepo: a Next.js app and the Mercator agent sit on a developer SDK, which sits
on the skill library, which settles on 13 Foundry contracts on Pharos.

```
   ┌───────────────────────────────────────────────────────────────────────────┐
   │  apps/web (Next.js)         @stoa/agent-mercator        @stoa/cli           │
   │  pages + API routes         Phase-2 flagship agent      run any skill       │
   └───────────────┬───────────────────────┬──────────────────────┬────────────┘
                   │                        │                      │
                   ▼                        ▼                      ▼
   ┌───────────────────────────────────────────────────────────────────────────┐
   │  @stoa/sdk — StoaClient (typed commerce client) + contracts/x402/treasury  │
   └───────────────────────────────┬───────────────────────────────────────────┘
                                    ▼
   ┌───────────────────────────────────────────────────────────────────────────┐
   │  @stoa/skills — 255 skills (Action {name,similes,schema,handler})          │
   │  commerce · chain · token · nft · defi · social · marketdata · utils · …   │
   │  adapters: LangChain · Vercel AI SDK · MCP · ElizaOS                        │
   └───────────────────────────────┬───────────────────────────────────────────┘
                                    │ viem (publicClient / walletClient) · x402 (HTTP 402)
                                    ▼
   ┌───────────────────────────────────────────────────────────────────────────┐
   │  contracts (Foundry) on Pharos Atlantic 688689 — 13 contracts              │
   │  StoaRegistry · StoaEscrow · ServiceRegistry · SocialFeed · TipJar ·       │
   │  Streaming · Faucet · SessionKeyManager · SubscriptionManager · AgentVault │
   │  · ArbiterPanel · RwaRegistry · ValueReputation                            │
   └───────────────────────────────────────────────────────────────────────────┘
```

## Packages

| Package | Role |
|---------|------|
| `@stoa/skills` | The Phase-1 deliverable: 255 skills as Pharos Agent Kit actions + 4 framework adapters. Owns the `StoaAgent` (viem) context, ABIs, chains, and the deployment-manifest loader. |
| `@stoa/sdk` | `StoaClient` — a typed, developer-facing commerce client wrapping the skills, plus `contracts/`, `x402/`, `treasury/` helpers, typed errors, and config. |
| `contracts` | 13 reentrancy-guarded, dependency-free Foundry contracts + tests + deploy/seed scripts + generated `abi/*.json`. |
| `@stoa/agent-mercator` | Phase-2 flagship agent: planner (seller scoring), scenario, trace, and the full commerce loop. |
| `@stoa/cli` | Zero-dep terminal that auto-exposes every skill. |
| `@stoa/examples` | Runnable per-skill demos + `99-full-commerce-loop.ts`. |
| `apps/web` | Next.js dashboard: pages (`/`, `/skills`, `/marketplace`, `/agents`, `/register`, `/connect`, `/protected`, `/playground`) + API routes (`/api/health`, `/api/skills`, `/api/services`, `/api/agents`, `/api/contracts`, `/api/run`, `/api/x402/weather`). Vendored from the x402 Next.js example. |

## Design principles

- **One interface, four surfaces.** A skill is defined once as an `Action`; the LangChain, Vercel
  AI, MCP, and ElizaOS adapters are generated from the same `actions` array.
- **Two clients, one logic.** Skills are LLM-facing tools; `StoaClient` is a typed developer API.
  Both call the identical on-chain code, so behavior never diverges.
- **Pure core, isolated integrations.** Chain access goes through `StoaAgent` (viem). Optional
  integrations (`@x402/*`, `express`) load via `loadOptional()` so the package builds without them.
- **Idempotent, explicit results.** Every handler returns `{ status, data, message }` and never
  throws across the boundary.
- **Safety wraps value movement.** `treasury_guard` gates every transfer behind allowlist, per-tx
  ceiling, rolling daily cap, and simulate-before-send.

## The commerce loop (data flow)

`discover` (`ServiceRegistry`) → `trust` (`StoaRegistry` identity + reputation) → `hire`
(`StoaEscrow.createJob`) → `pay` (x402 / `StoaEscrow`) → `settle` (`StoaEscrow.release`) → `rate`
(`StoaRegistry.attest` + `ValueReputation`). Proven on-chain offline by `MercatorFlow.t.sol` and
end-to-end through the skills by `scripts/integration.ts`.

## Skill domains (62)

`commerce` (the 7 flagship) plus supporting domains: `chain`, `token`, `nft`, `erc1155`, `native`,
`wallet`, `keys`, `typeddata`, `sigutils`, `social`, `tip`, `stream`, `subscription`, `sessionkey`,
`vault`, `dispute`, `rwa`, `repvalue`, `defi`, `marketdata`, `contract`, `events`, `simulate`,
`discovery`, `faucet`, `portfolio`, `multibalance`, `explorer`, `tokenlist`, `permit`, `permitsign`,
`erc165`, `erc721enum`, `vault4626`, `amm`, `pricemath`, `nodeinfo`, `rpc`, `gas`, `blocks`, `txops`,
`keeper`, `agentcard`, `siwe`, `utils`, `math`, `format`, `convert`, `bytes`, `encoding`, `hashing`,
`abitools`, `base64`, `random`, `duration`, `units`, `validate`, `addressutils`, `account`,
`chainreg`, `memo`, `time`. The full list is auto-generated in [SKILLS.md](SKILLS.md).
