# Stoa — Hackathon Submission

**Project:** Stoa — The Agent Commerce Stack for Pharos

**One-line pitch:** Most blockchain agent skills are read-only (check a balance, read a price) —
**Stoa lets Pharos agents transact with each other:** discover, prove identity, charge for APIs,
pay other agents, escrow work, guard spending, and build reputation, all on-chain.

Built for the **Pharos Skill-to-Agent Dual Cascade Hackathon** · Phase 1 (Skills) + Phase 2 (Agent Arena).

---

## The winning loop

```
discover → trust → hire → subcontract → pay → settle → rate
```

Phase 2's flagship agent, **Mercator**, is *just* this loop driven autonomously — proving the
Phase 1 skills compose into a real agent.

## The 7 commerce skills (Phase 1)

| Skill | What it unlocks |
|-------|-----------------|
| `x402_pay` | An agent can **buy** any paid API/service (x402, budget-guarded with `maxPrice`). |
| `x402_monetize` | An agent can **sell** its own output behind an x402 paywall (the seller half). |
| `agent_identity` | Register + resolve an on-chain agent identity in `StoaRegistry`. |
| `reputation` | Write a signed attestation after a job; read an agent's score (one per address). |
| `agent_escrow` | Hire another agent with milestone settlement (PHRS or ERC-20). |
| `treasury_guard` | Spend safely: allowlist, per-tx cap, daily cap, simulate-before-send. |
| `service_listing` | Browse + publish an on-chain marketplace of agent services. |

Each skill is a Pharos Agent Kit-compatible **action** (`{ name, similes, description, examples,
schema, handler }`) and ships with **LangChain**, **Vercel AI SDK**, and **MCP** adapters. Beneath
them sits a broad supporting toolkit (chain / token / NFT / DeFi / social / utils) so a single
agent never has to leave the SDK.

## The 13 smart contracts (Foundry, on Pharos Atlantic)

| Contract | Role |
|----------|------|
| `StoaRegistry` | ERC-8004-lite agent identity + reputation |
| `StoaEscrow` | milestone escrow for agent-to-agent jobs (PHRS / ERC-20) |
| `ServiceRegistry` | on-chain, browsable marketplace of agent services |
| `SocialFeed` | posts, replies, likes, and a follow graph |
| `TipJar` | tip other agents in PHRS, with per-pair accounting |
| `Streaming` | linear payment streams (Sablier-lite) |
| `Faucet` | rate-limited PHRS faucet to bootstrap new agents |
| `SessionKeyManager` | deposit + delegate scoped, expiring spend allowances to session keys |
| `SubscriptionManager` | recurring pull-payments (plans, subscribe, charge-per-period) |
| `AgentVault` | k-of-n multisig for shared agent / DAO treasuries |
| `ArbiterPanel` | on-chain dispute resolution — arbiters vote a verdict on escrow jobs |
| `RwaRegistry` | tokenized real-world-asset (RWA) receipts — Pharos's RealFi thesis |
| `ValueReputation` | reputation weighted by real settled value (hard-to-fake economic trust) |

All contracts are reentrancy-guarded, dependency-free (clean CertiK surface), and covered by a
fully offline test suite.

## How to run

```bash
# 1) Install
pnpm install

# 2) Contracts — build + test (offline)
pnpm contracts:test

# 3) The winning demo — the full commerce loop in one command (tx hashes printed)
pnpm demo:full

# 4) Or run the whole gauntlet: skills tests + contracts tests + demo
pnpm win
```

## Pharos specifics

| | |
|---|---|
| Network | Pharos Atlantic Testnet |
| Chain id | `688689` (CAIP-2 `eip155:688689`) |
| RPC | `https://atlantic.dplabs-internal.com/` |
| Native token | PHRS |

## Links

- [HACKATHON.md](HACKATHON.md) — pitch + judging matrix
- [docs/WINNING_FLOW.md](docs/WINNING_FLOW.md) — the one-loop framing
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — narrated demo output
- [docs/LIVE_DEPLOYMENT.md](docs/LIVE_DEPLOYMENT.md) — Pharos Atlantic addresses + seed proof
- [docs/HACKATHON_SUBMISSION.md](docs/HACKATHON_SUBMISSION.md) — final submission checklist

## License

MIT
