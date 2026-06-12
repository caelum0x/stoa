# Stoa — Hackathon Submission

**The Agent Commerce Stack for Pharos.**
Skill-to-Agent Dual Cascade Hackathon · Phase 1 (Skills) + Phase 2 (Agent Arena).

## Live Links

| Item | URL |
|---|---|
| GitHub | `https://github.com/caelum0x/stoa` |
| Vercel production | `https://pharos-7qxc3odaf-arhansubas-projects.vercel.app` |
| Live deployment proof | [`docs/LIVE_DEPLOYMENT.md`](docs/LIVE_DEPLOYMENT.md) |

## The one-sentence pitch

> Most blockchain agent skills are read-only — check a balance, read a price. **Stoa lets Pharos
> agents transact with each other:** discover, prove identity, charge for APIs, pay other agents,
> escrow work, guard spending, and build reputation — all on-chain.

## The six flagship skills (Phase 1)

| Skill | What it unlocks |
|-------|-----------------|
| `x402_pay` | An agent can **buy** any paid API/service (x402, budget-guarded). |
| `x402_monetize` | An agent can **sell** its own output behind an x402 paywall. |
| `agent_identity` | Register + resolve an on-chain agent identity. |
| `agent_escrow` | Hire another agent with milestone settlement. |
| `reputation` | Rate an agent after a job (one attestation per address). |
| `treasury_guard` | Spend safely: allowlist, per-tx cap, daily cap, simulate-before-send. |

`service_listing` (on-chain marketplace) rounds out the commerce core. Beneath these sits a broad
supporting toolkit (chain/token/NFT/DeFi/social/utils) so a single agent never has to leave the SDK.

## The winning demo — one loop, one command

```
discover → trust → hire → pay → settle → rate
```

```bash
pnpm install
pnpm contracts:test          # 54 tests, all green
pnpm --filter @stoa/skills test
pnpm demo:full               # the full commerce loop, with tx hashes
# or simply:
pnpm win                     # tests + contracts + demo
```

`packages/examples/src/99-full-commerce-loop.ts` runs two agents (buyer **Mercator**, seller
**Atlas**) through the entire loop — every step a real Pharos transaction. See
[docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the narrated output.

## How Stoa maps to the judging criteria

| Criterion | How Stoa wins |
|-----------|---------------|
| Originality | Agent-to-agent **commerce** (x402 + escrow + reputation), not another read-only tool. |
| Technical quality | 13 tested contracts, a typed SDK, schema-validated skills, deployment manifests, clean ABIs. |
| Practical use case | Agents earn and spend: paid APIs, escrowed jobs, recurring subscriptions, tips. |
| Reusability / composability | Each skill is standalone and composable; the SDK + adapters make them drop-in. |
| Pharos deployment | Foundry contracts deploy to Pharos Atlantic (688689) with a one-shot deploy script. |
| UX / docs | One-command demo, auto-generated skill catalog, per-package READMEs, architecture + security docs. |
| Ecosystem alignment | Built on Pharos-endorsed standards: **x402** payments + **ERC-8004**-style identity/reputation. |

## What's in the repo

- **`@stoa/skills`** — the Phase 1 deliverable: Pharos Agent Kit-compatible skills + LangChain /
  Vercel AI SDK / MCP / ElizaOS adapters.
- **`@stoa/sdk`** — `StoaClient`, the developer-facing commerce client.
- **`contracts`** — 13 Foundry contracts (registry, escrow, marketplace, social, tipping, streaming,
  subscriptions, session keys, multisig vault, dispute panel, RWA, value-reputation, faucet).
- **`@stoa/agent-mercator`** — the Phase 2 flagship agent running the full loop.
- **`@stoa/cli`** + **`@stoa/examples`** — terminal access + runnable per-skill demos.

See [docs/plan.md](docs/plan.md) for the full roadmap and [docs/WINNING_FLOW.md](docs/WINNING_FLOW.md)
for the demo flow.
