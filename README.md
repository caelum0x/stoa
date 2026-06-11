# Stoa — The Agent Commerce Stack for Pharos

> Composable Skills that let any Pharos agent **get paid, pay other agents, prove who it is, and
> settle work through on-chain escrow** — plus **Mercator**, a flagship agent that runs the full
> agent-to-agent economy loop on Pharos.

Built for the **Pharos Skill-to-Agent Dual Cascade Hackathon**. Stoa is the commerce rails for the
Pharos AI Agent economy: a suite of six reusable, Pharos Agent Kit-compatible skills and the
contracts they settle against.

```
discover → trust → hire → subcontract → pay → settle → rate
```

---

## Why Stoa

Most agent skills are read-only (balances, prices). Stoa builds the missing layer that lets agents
**transact with each other**:

- **x402 payments** — Stoa speaks Pharos's first-class agentic-payment standard, on both the
  buying and the selling side.
- **On-chain identity + reputation** — an ERC-8004-lite registry so agents can be discovered and
  trusted.
- **Milestone escrow** — trust-minimized settlement for agent-to-agent jobs.
- **Treasury guard** — a policy layer (allowlist, per-tx ceiling, daily cap, simulate-before-send)
  so autonomous spending stays safe.

Every skill targets the four highest-weighted judging criteria: originality, composability,
deployment on Pharos, and alignment with the agent-economy vision.

## The six skills

| Skill | Name | What it does |
|-------|------|--------------|
| 💸 | `x402_pay` | Auto-pay any x402-protected endpoint, with a `maxPrice` budget guard. |
| 🏷️ | `x402_monetize` | Put an agent's output behind an x402 paywall (the seller half). |
| 🪪 | `agent_identity` | Register / resolve agent identity in `StoaRegistry`. |
| ⭐ | `reputation` | Write a signed attestation after a job; read an agent's score. |
| 🤝 | `agent_escrow` | Create / release / refund milestone escrow (PHRS or ERC-20). |
| 🛡️ | `treasury_guard` | Policy-guarded transfers: allowlist, caps, simulate-before-send. |

Each skill is a Pharos Agent Kit-compatible **action** (`{ name, similes, description, examples,
schema, handler }`) and ships with **LangChain**, **Vercel AI SDK**, and **MCP** adapters.

### The full skill library (220+ skills, 50+ domains)

The seven commerce skills above are the flagship. They sit on top of a **comprehensive Pharos
agent toolkit** so a single agent can do everything on-chain without leaving the Stoa SDK:

| Domain | Examples |
|--------|----------|
| `chain` | block number, gas price, native balance, tx status, chain info, estimate gas |
| `token` (ERC-20) | balance, transfer, approve, allowance, metadata, transferFrom |
| `nft` / `erc1155` | ownerOf, tokenURI, transfer, approvals, batch balances |
| `native` | transfer, multisend |
| `wallet` / `keys` / `typeddata` | sign/verify message, sign typed data, generate keys |
| `social` / `tip` / `stream` | post/reply/like/follow, tip & withdraw, payment streams |
| `defi` | price feeds, ERC-4626 vaults, Uniswap-v2 reserves |
| `contract` / `events` / `simulate` | generic read/write/multicall, log queries, call simulation |
| `discovery` | enumerate agents & services from on-chain events |
| `utils` / `math` / `format` / `convert` / `bytes` / `encoding` | pure on-chain helpers |
| `faucet` / `portfolio` / `explorer` / `tokenlist` | bootstrap gas, aggregate holdings, build explorer links |

See the auto-generated [**full catalog → docs/SKILLS.md**](docs/SKILLS.md). Regenerate with
`pnpm --filter @stoa/skills exec tsx scripts/gen-catalog.ts`.

## Monorepo layout

```
stoa/
├── packages/
│   ├── skills/          @stoa/skills — the six skills + adapters (Phase 1 deliverable)
│   ├── contracts/       Foundry: StoaRegistry + StoaEscrow (+ tests, deploy script)
│   ├── agent-mercator/  @stoa/agent-mercator — the Phase 2 flagship agent
│   └── examples/        runnable, per-skill examples
├── docs/                architecture, security model, deployment
└── README.md
```

## Smart contracts (Foundry, on Pharos Atlantic)

| Contract | Role |
|----------|------|
| `StoaRegistry` | ERC-8004-lite agent identity + reputation |
| `StoaEscrow` | milestone escrow for agent-to-agent jobs (PHRS / ERC-20) |
| `ServiceRegistry` | on-chain, browsable marketplace of agent services |
| `SocialFeed` | posts, replies, likes, and a follow graph |
| `TipJar` | tip other agents in PHRS, with per-pair accounting |
| `Streaming` | linear payment streams (Sablier-lite) |
| `Faucet` | rate-limited PHRS faucet to bootstrap new agents |

All contracts are reentrancy-guarded, dependency-free (clean CertiK surface), and covered by a
fully offline test suite (`pnpm contracts:test`).

## Quick start

```bash
# 1) Install
pnpm install

# 2) Contracts — build, test, deploy to Pharos Atlantic (chain 688689)
pnpm contracts:test
cp .env.example .env            # fill in PRIVATE_KEY + STOA_PRIVATE_KEY (testnet keys)
pnpm contracts:deploy           # prints StoaRegistry + StoaEscrow addresses

# 3) Skills — typecheck, test, build
pnpm --filter @stoa/skills test
pnpm build

# 4) Run the flagship loop (needs two funded testnet keys + deployed addresses)
pnpm --filter @stoa/agent-mercator start
```

> **Network note:** the optional `@x402/*` packages and `express` power the live payment skills.
> They are declared as `optionalDependencies`; install them in your environment to exercise
> `x402_pay` / `x402_monetize` against a running facilitator.

## Using the skills in your own agent

```ts
import { StoaAgent } from "@stoa/skills";
import { createLangchainTools } from "@stoa/skills/langchain";

const agent = StoaAgent.fromEnv();          // STOA_PRIVATE_KEY, PHAROS_RPC_URL, ...
const tools = createLangchainTools(agent);  // drop into any LangChain agent
```

Vercel AI SDK and MCP are equally one line — see [`packages/skills/README.md`](packages/skills/README.md).

## Pharos specifics

| | |
|---|---|
| Network | Pharos Atlantic Testnet |
| Chain id | `688689` (CAIP-2 `eip155:688689`) |
| RPC | `https://atlantic.dplabs-internal.com/` |
| Native token | PHRS |
| Test USDC | `0xE0BE08c77f415F577A1B3A9aD7a1Df1479564ec8` |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Security model](docs/SECURITY.md) — CertiK-driven design constraints
- [Deployment](docs/DEPLOYMENT.md)
- [Skills reference](packages/skills/README.md)
- [Contracts](packages/contracts/README.md)
- [Mercator (Phase 2)](packages/agent-mercator/README.md)

## License

MIT
