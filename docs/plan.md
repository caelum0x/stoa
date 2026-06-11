Your current `packages/` layout is good. **Do not restart or heavily reorganize it.** I would evolve it like this:

```txt
packages/
├── agent-mercator/   ✅ keep: flagship Phase 2 agent
├── contracts/        ✅ keep: Foundry contracts
├── examples/         ✅ keep: runnable demos
├── sdk/              ✅ keep: shared Stoa client/facade
└── skills/           ✅ keep: Phase 1 deliverable
```

The biggest change I recommend is conceptual:

**`packages/skills` = hackathon Skill submission**
**`packages/contracts` = on-chain settlement layer**
**`packages/sdk` = clean developer-facing client used by skills, examples, and Mercator**
**`packages/agent-mercator` = complete Agent Arena demo**

Pharos official examples already include a `skills/x402-pharos` reference, so your repo should reuse that direction instead of inventing the x402 integration from zero. ([GitHub][1]) Pharos docs also currently identify Atlantic Testnet as chain ID `688689`, and their x402 resource says the x402 skill supports Atlantic testnet with a test USDC token. ([docs.pharosnetwork.xyz][2]) ([docs.pharosnetwork.xyz][3])

---

# 1. What your current structure should become

Based on your screenshot, I would target this exact next-state structure.

```txt
packages/
├── agent-mercator/
│   ├── src/
│   │   ├── index.ts
│   │   ├── mercator.ts
│   │   ├── config.ts
│   │   ├── scenario.ts
│   │   ├── prompts.ts
│   │   ├── planner.ts
│   │   ├── wallet.ts
│   │   ├── demo/
│   │   │   ├── run-full-loop.ts
│   │   │   ├── run-buyer-agent.ts
│   │   │   ├── run-seller-agent.ts
│   │   │   └── run-subcontractor-agent.ts
│   │   └── traces/
│   │       └── trace-writer.ts
│   ├── package.json
│   ├── README.md
│   └── tsconfig.json
│
├── contracts/
│   ├── src/
│   │   ├── StoaRegistry.sol
│   │   ├── StoaEscrow.sol
│   │   ├── ServiceRegistry.sol
│   │   ├── SocialFeed.sol
│   │   ├── TipJar.sol
│   │   ├── Faucet.sol
│   │   ├── SessionKeyManager.sol       # add later if time
│   │   ├── SubscriptionManager.sol     # optional
│   │   ├── Streaming.sol               # optional if your stream skill exists
│   │   ├── AgentVault.sol              # optional
│   │   ├── interfaces/
│   │   │   ├── IStoaRegistry.sol
│   │   │   ├── IStoaEscrow.sol
│   │   │   ├── IServiceRegistry.sol
│   │   │   └── ITipJar.sol
│   │   ├── libraries/
│   │   │   ├── StoaTypes.sol
│   │   │   ├── SignatureLib.sol
│   │   │   └── SafeTransferLib.sol
│   │   └── mocks/
│   │       ├── MockERC20.sol
│   │       └── MockAgent.sol
│   ├── script/
│   │   ├── Deploy.s.sol                # keep
│   │   ├── DeployAtlantic.s.sol        # add
│   │   ├── DeployLocal.s.sol           # add
│   │   ├── SeedDemo.s.sol              # add
│   │   └── ExportAbis.s.sol            # optional
│   ├── test/
│   │   ├── StoaRegistry.t.sol
│   │   ├── StoaEscrow.t.sol
│   │   ├── ServiceRegistry.t.sol
│   │   ├── SocialFeed.t.sol
│   │   ├── TipJar.t.sol
│   │   ├── Faucet.t.sol
│   │   ├── MercatorFlow.t.sol          # add: full commerce loop
│   │   └── invariants/
│   │       └── EscrowInvariant.t.sol
│   ├── deployments/
│   │   ├── localhost.json
│   │   └── pharos-atlantic.json
│   ├── abi/
│   │   ├── StoaRegistry.json
│   │   ├── StoaEscrow.json
│   │   ├── ServiceRegistry.json
│   │   ├── SocialFeed.json
│   │   ├── TipJar.json
│   │   └── Faucet.json
│   ├── foundry.toml
│   ├── package.json
│   └── README.md
│
├── examples/
│   ├── src/
│   │   ├── index.ts
│   │   ├── 01-register-agent.ts
│   │   ├── 02-list-service.ts
│   │   ├── 03-x402-pay.ts
│   │   ├── 04-x402-monetize-server.ts
│   │   ├── 05-create-escrow.ts
│   │   ├── 06-release-escrow.ts
│   │   ├── 07-write-reputation.ts
│   │   ├── 08-treasury-guard-transfer.ts
│   │   └── 09-full-agent-commerce-loop.ts
│   ├── servers/
│   │   └── x402-seller-api.ts
│   ├── package.json
│   ├── README.md
│   └── tsconfig.json
│
├── sdk/
│   ├── src/
│   │   ├── index.ts
│   │   ├── StoaClient.ts
│   │   ├── StoaAgent.ts
│   │   ├── config.ts
│   │   ├── chains.ts
│   │   ├── addresses.ts
│   │   ├── abis.ts
│   │   ├── contracts/
│   │   │   ├── registry.ts
│   │   │   ├── escrow.ts
│   │   │   ├── services.ts
│   │   │   ├── social.ts
│   │   │   ├── tipjar.ts
│   │   │   └── faucet.ts
│   │   ├── x402/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── treasury/
│   │   │   ├── guard.ts
│   │   │   ├── policy.ts
│   │   │   └── simulate.ts
│   │   ├── types.ts
│   │   └── errors.ts
│   ├── package.json
│   ├── README.md
│   └── tsconfig.json
│
└── skills/
    ├── src/
    │   ├── index.ts
    │   ├── stoa.ts
    │   ├── config.ts
    │   ├── types.ts
    │   ├── action.ts
    │   ├── errors.ts
    │   ├── adapters/
    │   │   ├── langchain.ts
    │   │   ├── vercel-ai.ts
    │   │   └── mcp.ts
    │   ├── actions/
    │   │   ├── commerce/
    │   │   │   ├── x402-pay.ts
    │   │   │   ├── x402-monetize.ts
    │   │   │   ├── agent-identity.ts
    │   │   │   ├── reputation.ts
    │   │   │   ├── agent-escrow.ts
    │   │   │   ├── treasury-guard.ts
    │   │   │   └── index.ts
    │   │   ├── chain/
    │   │   ├── contract/
    │   │   ├── discovery/
    │   │   ├── erc1155/
    │   │   ├── events/
    │   │   ├── faucet/
    │   │   ├── format/
    │   │   ├── keys/
    │   │   ├── math/
    │   │   ├── native/
    │   │   ├── nft/
    │   │   ├── portfolio/
    │   │   ├── social/
    │   │   ├── stream/
    │   │   ├── tip/
    │   │   ├── token/
    │   │   └── wallet/
    │   ├── generated/
    │   │   ├── catalog.ts
    │   │   └── skills.json
    │   └── __tests__/
    │       ├── commerce.test.ts
    │       ├── adapters.test.ts
    │       └── schemas.test.ts
    ├── scripts/
    │   └── gen-catalog.ts
    ├── package.json
    ├── README.md
    └── tsconfig.json
```

---

# 2. Do this, not a big rewrite

Your screenshot already shows many action domains under `packages/skills/src/actions`. That is useful, but for the hackathon you should **make the six Stoa commerce skills visually obvious**.

Add this folder:

```txt
packages/skills/src/actions/commerce/
```

Put the hackathon-critical skills there:

```txt
x402-pay.ts
x402-monetize.ts
agent-identity.ts
reputation.ts
agent-escrow.ts
treasury-guard.ts
index.ts
```

Then keep all existing folders like `chain`, `token`, `nft`, `faucet`, `social`, `tip`, `stream`, and `wallet` as supporting utility skills.

Your README should say:

```md
## Flagship Hackathon Skills

The Stoa Phase 1 submission focuses on six composable commerce skills:

1. x402_pay
2. x402_monetize
3. agent_identity
4. reputation
5. agent_escrow
6. treasury_guard

The broader SDK also includes generated Pharos utility actions across wallet, token, NFT,
social, tipping, streaming, faucet, discovery, formatting, and contract interaction.
```

This makes the project look serious instead of scattered.

---

# 3. Package responsibilities

## `packages/contracts`

This should own the settlement layer.

You already have:

```txt
Faucet.sol
ServiceRegistry.sol
SocialFeed.sol
StoaEscrow.sol
StoaRegistry.sol
TipJar.sol
```

That is enough for a strong hackathon build.

I would prioritize them like this:

| Priority | Contract              | Why                                     |
| -------- | --------------------- | --------------------------------------- |
| P0       | `StoaRegistry.sol`    | Agent identity and basic reputation     |
| P0       | `StoaEscrow.sol`      | Core agent-to-agent job settlement      |
| P0       | `ServiceRegistry.sol` | Agent service discovery / marketplace   |
| P1       | `TipJar.sol`          | Simple payments and social proof        |
| P1       | `SocialFeed.sol`      | Demo-friendly agent social interactions |
| P2       | `Faucet.sol`          | Useful but not central                  |

Do **not** add too many contracts unless the current ones are already fully tested.

For the hackathon, this is better:

```txt
6 contracts, all tested, all deployed, all used by skills
```

than:

```txt
12 contracts, half-finished
```

---

## `packages/sdk`

Right now your `sdk` package looks thin. Make it the reusable core that every other package imports.

The SDK should export:

```ts
export { StoaClient } from "./StoaClient";
export { StoaAgent } from "./StoaAgent";
export { pharosAtlantic } from "./chains";
export { stoaAddresses } from "./addresses";
export type {
  AgentProfile,
  ServiceListing,
  EscrowJob,
  TreasuryPolicy,
  StoaConfig,
} from "./types";
```

The SDK should **not** expose LangChain, Vercel, or MCP. That belongs in `packages/skills`.

Use the SDK for:

```txt
contract reads
contract writes
x402 helper clients
address config
chain config
simulation
treasury policy checks
typed errors
```

This avoids duplicating viem logic inside every skill.

---

## `packages/skills`

This is your Phase 1 judging package.

Each skill should follow one shape:

```ts
export const agentIdentitySkill = {
  name: "agent_identity",
  similes: [
    "register agent",
    "resolve agent",
    "agent profile",
    "agent identity",
  ],
  description:
    "Register, update, and resolve an on-chain Stoa agent identity on Pharos.",
  examples: [
    "Register my agent with name Mercator",
    "Resolve the agent at 0x...",
    "Update my agent metadata URI",
  ],
  schema,
  handler,
};
```

The Pharos Agent Kit README shows an action/tool style with LangChain, Vercel AI SDK, MCP, zod validation, and viem-based blockchain interactions, so matching that structure is smart for ecosystem fit. ([GitHub][4])

---

## `packages/examples`

This should be judge-friendly.

Do not make judges guess how the repo works. Give them one command per demo.

Recommended examples:

```txt
01-register-agent.ts
02-list-service.ts
03-x402-pay.ts
04-x402-monetize-server.ts
05-create-escrow.ts
06-release-escrow.ts
07-write-reputation.ts
08-treasury-guard-transfer.ts
09-full-agent-commerce-loop.ts
```

The most important file is:

```txt
09-full-agent-commerce-loop.ts
```

It should print something like:

```txt
[1] Buyer agent registered
[2] Seller agent registered
[3] Seller listed paid service
[4] Buyer discovered seller
[5] Buyer created escrow
[6] Seller subcontracted task to helper agent
[7] Buyer paid protected x402 endpoint
[8] Escrow released
[9] Reputation attestation written
[10] Final agent scores printed
```

That is the demo judges will understand.

---

## `packages/agent-mercator`

This is your Phase 2 flagship agent.

Mercator should not be “an AI chatbot.” It should be a **commerce orchestrator agent**.

Mercator’s loop:

```txt
discover service
check identity
check reputation
simulate payment
create escrow
call x402-protected seller endpoint
subcontract if needed
release escrow
write reputation
publish social proof
```

Your `agent-mercator/src/index.ts` should be very small:

```ts
import { runMercatorDemo } from "./mercator";

runMercatorDemo().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Put real logic in:

```txt
mercator.ts
planner.ts
scenario.ts
wallet.ts
```

---

# 4. Open-source cloning plan

Create an `external/` folder at the repo root.

```bash
mkdir -p external
```

Then clone these:

```bash
git clone https://github.com/PharosNetwork/examples external/pharos-examples
git clone https://github.com/PharosNetwork/pharos-skill-engine external/pharos-skill-engine
git clone https://github.com/x402-foundation/x402 external/x402
git clone https://github.com/pharos-agent-kit/pharos-agent-kit external/pharos-agent-kit
```

Add this to `.gitignore`:

```gitignore
external/
```

Then add `external/README.md`:

```md
# External References

This folder is intentionally gitignored. It is used for local reference while building Stoa.

Recommended references:

- PharosNetwork/examples
- PharosNetwork/pharos-skill-engine
- x402-foundation/x402
- pharos-agent-kit/pharos-agent-kit

Do not copy code directly without checking license compatibility and adding attribution.
```

Why these:

| Repo                     | Use it for                                                   |
| ------------------------ | ------------------------------------------------------------ |
| `PharosNetwork/examples` | Pharos deployment examples, especially x402 Pharos reference |
| `pharos-skill-engine`    | Skill conventions and Pharos-specific config                 |
| `x402-foundation/x402`   | Buyer/seller payment flow and x402 examples                  |
| `pharos-agent-kit`       | Adapter style for LangChain, Vercel AI SDK, and MCP          |

x402’s reference repo describes the typical flow as: client requests a resource, server returns `402 Payment Required`, client creates a payment payload, retries with payment data, and the server verifies through a facilitator or local verification. ([GitHub][5]) That maps directly to your `x402_pay` and `x402_monetize` skills.

---

# 5. Root files you should add

At root level, add or update these files:

```txt
README.md
HACKATHON.md
SUBMISSION.md
LICENSE
NOTICE
.env.example
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
.gitignore
.prettierrc
eslint.config.js
```

Recommended root `package.json`:

```json
{
  "name": "stoa",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "contracts:build": "pnpm --filter @stoa/contracts build",
    "contracts:test": "pnpm --filter @stoa/contracts test",
    "contracts:deploy": "pnpm --filter @stoa/contracts deploy:atlantic",
    "skills:test": "pnpm --filter @stoa/skills test",
    "skills:catalog": "pnpm --filter @stoa/skills catalog",
    "demo": "pnpm --filter @stoa/examples demo",
    "mercator": "pnpm --filter @stoa/agent-mercator start"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "tsx": "^4.19.0",
    "turbo": "^2.5.0",
    "vitest": "^3.2.0",
    "tsup": "^8.4.0",
    "prettier": "^3.5.0"
  },
  "packageManager": "pnpm@10.0.0"
}
```

Recommended `pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
```

Recommended root `.env.example`:

```bash
# Pharos
PHAROS_RPC_URL=https://atlantic.dplabs-internal.com
PHAROS_CHAIN_ID=688689

# Wallets
STOA_PRIVATE_KEY=
BUYER_PRIVATE_KEY=
SELLER_PRIVATE_KEY=
HELPER_PRIVATE_KEY=

# Contracts
STOA_REGISTRY_ADDRESS=
STOA_ESCROW_ADDRESS=
SERVICE_REGISTRY_ADDRESS=
SOCIAL_FEED_ADDRESS=
TIP_JAR_ADDRESS=
FAUCET_ADDRESS=

# x402
X402_FACILITATOR_URL=
X402_RECEIVING_ADDRESS=
X402_TEST_USDC_ADDRESS=

# Demo
MERCATOR_LOG_LEVEL=debug
```

---

# 6. Build order

Do the project in this order.

## Step 1 — Make contracts stable

Finish and test:

```txt
StoaRegistry.sol
StoaEscrow.sol
ServiceRegistry.sol
TipJar.sol
SocialFeed.sol
Faucet.sol
```

Minimum contract test coverage:

```txt
register agent
update metadata
list service
find service
create escrow
release escrow
refund escrow
tip agent
post social message
claim faucet with cooldown
```

Add one integration test:

```txt
MercatorFlow.t.sol
```

That test should simulate the whole commerce lifecycle without AI.

---

## Step 2 — Build SDK

Implement:

```txt
StoaClient.registerAgent()
StoaClient.resolveAgent()
StoaClient.listService()
StoaClient.createEscrow()
StoaClient.releaseEscrow()
StoaClient.refundEscrow()
StoaClient.writeReputation()
StoaClient.tip()
StoaClient.post()
StoaClient.simulateTransfer()
StoaClient.guardedTransfer()
```

All skills should call SDK methods instead of talking to contracts directly.

---

## Step 3 — Build six flagship skills

Implement these first:

```txt
x402_pay
x402_monetize
agent_identity
reputation
agent_escrow
treasury_guard
```

Each one needs:

```txt
name
description
similes
examples
zod schema
handler
unit test
example script
README section
```

---

## Step 4 — Build adapters

Add:

```txt
packages/skills/src/adapters/langchain.ts
packages/skills/src/adapters/vercel-ai.ts
packages/skills/src/adapters/mcp.ts
```

The goal is to say:

```ts
import { createLangchainTools } from "@stoa/skills/langchain";
import { createVercelTools } from "@stoa/skills/vercel-ai";
import { createMcpServer } from "@stoa/skills/mcp";
```

---

## Step 5 — Build Mercator

Mercator should use the exact same skills that external developers use.

Do not give Mercator secret internal methods. That weakens the composability story.

Mercator imports:

```ts
import { StoaAgent } from "@stoa/sdk";
import { createStoaSkills } from "@stoa/skills";
```

Then it runs:

```txt
buyer agent
seller agent
helper agent
```

The demo should prove:

```txt
agent discovery
agent trust
agent hiring
x402 payment
escrow settlement
reputation write
```

---

# 7. What to add to your current `contracts/`

Your screenshot shows `Deploy.s.sol`. Keep it, but add network-specific scripts.

```txt
packages/contracts/script/
├── Deploy.s.sol
├── DeployAtlantic.s.sol
├── DeployLocal.s.sol
└── SeedDemo.s.sol
```

`DeployAtlantic.s.sol` should deploy all P0/P1 contracts and write addresses to console.

Contract deploy order:

```txt
1. StoaRegistry
2. ServiceRegistry
3. StoaEscrow
4. SocialFeed
5. TipJar
6. Faucet
```

Then copy the addresses into:

```txt
packages/contracts/deployments/pharos-atlantic.json
```

Example:

```json
{
  "chainId": 688689,
  "network": "pharos-atlantic",
  "deployedAt": "2026-06-11T00:00:00.000Z",
  "contracts": {
    "StoaRegistry": "0x...",
    "ServiceRegistry": "0x...",
    "StoaEscrow": "0x...",
    "SocialFeed": "0x...",
    "TipJar": "0x...",
    "Faucet": "0x..."
  }
}
```

---

# 8. What to add to your current `skills/`

Add a commerce index:

```ts
// packages/skills/src/actions/commerce/index.ts

export { x402PaySkill } from "./x402-pay";
export { x402MonetizeSkill } from "./x402-monetize";
export { agentIdentitySkill } from "./agent-identity";
export { reputationSkill } from "./reputation";
export { agentEscrowSkill } from "./agent-escrow";
export { treasuryGuardSkill } from "./treasury-guard";

export const commerceSkills = [
  x402PaySkill,
  x402MonetizeSkill,
  agentIdentitySkill,
  reputationSkill,
  agentEscrowSkill,
  treasuryGuardSkill,
];
```

Then in your main skills index:

```ts
// packages/skills/src/index.ts

export * from "./actions/commerce";
export * from "./adapters/langchain";
export * from "./adapters/vercel-ai";
export * from "./adapters/mcp";
export * from "./stoa";
```

---

# 9. Recommended package names

Use scoped package names:

```txt
@stoa/contracts
@stoa/sdk
@stoa/skills
@stoa/examples
@stoa/agent-mercator
```

Example `packages/skills/package.json`:

```json
{
  "name": "@stoa/skills",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./langchain": "./dist/adapters/langchain.js",
    "./vercel-ai": "./dist/adapters/vercel-ai.js",
    "./mcp": "./dist/adapters/mcp.js"
  },
  "scripts": {
    "build": "tsup src/index.ts src/adapters/langchain.ts src/adapters/vercel-ai.ts src/adapters/mcp.ts --format esm --dts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "catalog": "tsx scripts/gen-catalog.ts"
  },
  "dependencies": {
    "@stoa/sdk": "workspace:*",
    "zod": "^3.25.0",
    "viem": "^2.31.0"
  },
  "optionalDependencies": {
    "@x402/core": "^0.6.0",
    "@x402/fetch": "^0.6.0",
    "@x402/express": "^0.6.0",
    "@x402/evm": "^0.6.0",
    "@langchain/core": "^0.3.0",
    "ai": "^5.0.0",
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

Check the exact latest package versions before final submission, but this is the correct dependency shape. x402’s seller docs currently point developers to preconfigured examples and `@x402/express`, while the x402 repo documents the broader standard and package ecosystem. ([docs.x402.org][6]) ([GitHub][5])

---

# 10. Minimum viable judging demo

Your final hackathon demo should not show all 220+ skills. It should show one clean loop:

```txt
Mercator: "Find me an agent that can summarize a document for ≤ 0.1 USDC."

1. Buyer agent resolves available services from ServiceRegistry.
2. Buyer checks seller identity in StoaRegistry.
3. Buyer checks seller reputation.
4. Buyer creates an escrow job.
5. Seller exposes result through x402_monetize.
6. Buyer uses x402_pay to buy the result.
7. Buyer releases escrow.
8. Buyer writes a reputation attestation.
9. Both agents post a social proof event.
```

This maps perfectly to your slogan:

```txt
discover → trust → hire → subcontract → pay → settle → rate
```

---

# 11. What I would remove or de-emphasize

I would **not** lead with:

```txt
220+ skills, 50+ domains
```

That can make the project sound generated.

Instead lead with:

```txt
Six production-style commerce skills for the Pharos agent economy.
```

Then later say:

```txt
Also includes a generated utility catalog for common Pharos actions.
```

The judging criteria reward usefulness, composability, deployment, and ecosystem relevance. A tight six-skill commerce stack is more convincing than a huge catalog.

---

# 12. Immediate next tasks

Do these next, in order:

```txt
1. Add packages/skills/src/actions/commerce/
2. Move or create the six flagship skills there.
3. Make packages/sdk/src/StoaClient.ts.
4. Make every skill call StoaClient instead of duplicating chain logic.
5. Add deployments/pharos-atlantic.json.
6. Add examples/09-full-agent-commerce-loop.ts.
7. Add docs/HACKATHON_SUBMISSION.md.
8. Add docs/DEMO_SCRIPT.md.
9. Update README to focus on the six flagship skills.
10. Run contracts test + skills test + one full demo command.
```

Your current repo is already pointed in the right direction. The main thing now is to make the **commerce story obvious**, make the six flagship skills easy to review, and make Mercator prove that the skills compose into a real on-chain agent economy.

[1]: https://github.com/PharosNetwork/examples "GitHub - PharosNetwork/examples: Pharos Examples · GitHub"
[2]: https://docs.pharosnetwork.xyz/developer-guide/hardhat/write-your-first-token?utm_source=chatgpt.com "Write Your First Token | docs.pharos.xyz"
[3]: https://docs.pharosnetwork.xyz/resources/x402?utm_source=chatgpt.com "x402 | docs.pharos.xyz"
[4]: https://github.com/pharos-agent-kit/pharos-agent-kit "GitHub - pharos-agent-kit/pharos-agent-kit: Pharos Agent Kit is a comprehensive toolkit designed to simplify AI agents' interactions with Pharos blockchain · GitHub"
[5]: https://github.com/x402-foundation/x402 "GitHub - x402-foundation/x402: A payments protocol for the internet. Built on HTTP. · GitHub"
[6]: https://docs.x402.org/getting-started/quickstart-for-sellers "Quickstart for Sellers - x402"
# Winning plan: make Stoa the **commerce layer for Pharos agents**

Your strongest path is **not** “220 skills.” Your strongest path is:

> **Stoa turns Pharos agents into businesses: agents can discover each other, prove identity, charge for APIs, pay other agents, escrow work, guard treasury spending, and write reputation on-chain.**

That is much more memorable to judges.

Your project should be submitted as:

```txt
Stoa
The Agent Commerce Stack for Pharos

Core thesis:
Most agent skills let agents read blockchain state.
Stoa lets agents transact with each other safely.
```

The winning demo should be one loop:

```txt
discover → trust → hire → pay → settle → rate
```

A judge should understand the full project in 60 seconds and run it in 5 minutes.

---

# 1. Your winning scope

Do **not** try to finish every possible skill. Win with a tight, complete, deployed commerce stack.

## Phase 1 submission: Stoa Skills

Submit these as the flagship skills:

| Priority | Skill            | Winning reason                                                |
| -------- | ---------------- | ------------------------------------------------------------- |
| P0       | `x402_pay`       | Agent can buy paid APIs/services.                             |
| P0       | `x402_monetize`  | Agent can sell its own output.                                |
| P0       | `agent_identity` | Agent can register and resolve identity on-chain.             |
| P0       | `agent_escrow`   | Agent can hire another agent with milestone settlement.       |
| P0       | `reputation`     | Agent can rate another agent after a job.                     |
| P0       | `treasury_guard` | Agent can spend safely with allowlists, caps, and simulation. |

Then add **bonus skills only if stable**:

| Priority | Bonus skill           | Use                                                                                           |
| -------- | --------------------- | --------------------------------------------------------------------------------------------- |
| P1       | `service_marketplace` | List and discover agent services from `ServiceRegistry`.                                      |
| P1       | `arbiter_panel`       | Dispute handling for escrow; this matches the `ArbiterPanel` work visible in your screenshot. |
| P2       | `social_proof`        | Post job completion / proof to `SocialFeed`.                                                  |
| P2       | `tip_agent`           | Simple agent-to-agent appreciation payments.                                                  |

The Pharos examples repo currently includes a `skills/x402-pharos` folder, so use that as your Pharos-specific x402 reference instead of inventing everything from scratch. The official x402 repo also provides TypeScript packages such as `@x402/core`, `@x402/fetch`, and `@x402/express`, which are exactly what your buyer and seller skills should wrap. ([GitHub][1])

---

# 2. The product story that can win

Your README, demo, and submission should use this exact framing:

```md
## Problem

AI agents can read blockchain data, but they cannot safely run an economy.

They need to:
- discover service providers,
- verify who they are,
- buy paid APIs,
- sell their own outputs,
- escrow work,
- protect autonomous spending,
- and build reputation over time.

## Solution

Stoa is a composable commerce stack for Pharos agents.

It provides six reusable Skills and supporting contracts that let any agent:
1. register an on-chain identity,
2. publish a paid service,
3. charge through x402,
4. pay another agent through x402,
5. settle work through escrow,
6. and write reputation after completion.

## Demo

Mercator, a flagship Pharos agent, uses Stoa to discover a seller agent,
create escrow, pay an x402-protected endpoint, release funds, and rate the seller.
```

That aligns directly with the hackathon’s judging criteria: originality, composability, Pharos deployment, practical agent use case, documentation, and ecosystem relevance.

---

# 3. Project structure to win

Keep your current monorepo. Make it look intentional and judge-friendly.

```txt
pharos/
├── README.md
├── HACKATHON.md
├── SUBMISSION.md
├── NOTICE
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEMO_SCRIPT.md
│   ├── DEPLOYMENT.md
│   ├── HACKATHON_SUBMISSION.md
│   ├── SECURITY.md
│   ├── SKILLS.md
│   └── WINNING_FLOW.md
├── deployments/
│   └── pharos-atlantic.json
├── oss/                         # gitignored open-source references
└── packages/
    ├── contracts/
    ├── sdk/
    ├── skills/
    ├── examples/
    ├── cli/
    └── agent-mercator/
```

Inside `packages/skills`, make the hackathon skills impossible to miss:

```txt
packages/skills/src/actions/
├── commerce/
│   ├── x402-pay.ts
│   ├── x402-monetize.ts
│   ├── agent-identity.ts
│   ├── agent-escrow.ts
│   ├── reputation.ts
│   ├── treasury-guard.ts
│   ├── service-marketplace.ts      # bonus
│   ├── arbiter-panel.ts            # bonus if stable
│   └── index.ts
├── chain/
├── token/
├── native/
├── nft/
├── social/
├── tip/
├── stream/
├── faucet/
└── ...
```

Your generated 220+ skill catalog can stay, but it should be positioned as supporting infrastructure. The judge-facing story should be the **six commerce skills**.

---

# 4. The one demo that matters

Build one perfect scenario.

## Demo name

```txt
Mercator Agent Commerce Loop
```

## Characters

```txt
Buyer Agent: Mercator
Seller Agent: Atlas
Helper Agent: Scribe
```

## Demo flow

```txt
1. Mercator registers its identity on StoaRegistry.
2. Atlas registers its identity on StoaRegistry.
3. Atlas lists a paid “research summary” service in ServiceRegistry.
4. Mercator discovers Atlas.
5. Mercator checks Atlas reputation.
6. Mercator creates an escrow job.
7. Atlas serves the result through an x402-protected endpoint.
8. Mercator uses x402_pay to buy the result.
9. Atlas optionally subcontracts a small task to Scribe.
10. Mercator releases escrow.
11. Mercator writes a reputation attestation for Atlas.
12. Both agents publish a social proof event.
```

## Judge-visible output

Your demo command should print clean logs:

```txt
$ pnpm demo:commerce

[1/12] Buyer agent registered
      agent: Mercator
      tx: 0x...

[2/12] Seller agent registered
      agent: Atlas
      tx: 0x...

[3/12] Seller listed x402-paid service
      service: research.summary.v1
      price: 0.01 USDC
      tx: 0x...

[4/12] Buyer discovered seller
      seller: Atlas
      reputation: 4.8 / 5

[5/12] Treasury guard approved payment
      maxPrice: 0.02 USDC
      dailyRemaining: 0.18 USDC

[6/12] Escrow created
      jobId: 1
      tx: 0x...

[7/12] x402 endpoint requested
      status: 402 Payment Required

[8/12] Payment completed
      tx: 0x...

[9/12] Seller delivered result
      sha256: 0x...

[10/12] Escrow released
       tx: 0x...

[11/12] Reputation written
       score: 5
       tx: 0x...

[12/12] Commerce loop complete
       discover → trust → hire → pay → settle → rate
```

This is how you win: one clean, undeniable proof that your skills compose.

---

# 5. Package-by-package winning plan

## `packages/contracts`

Goal: contracts are boring, secure, tested, and deployed.

### P0 contracts

```txt
StoaRegistry.sol
StoaEscrow.sol
ServiceRegistry.sol
```

### P1 contracts

```txt
SocialFeed.sol
TipJar.sol
ArbiterPanel.sol
```

### P2 contracts

```txt
Streaming.sol
SubscriptionManager.sol
SessionKeyManager.sol
AgentVault.sol
```

Do not let P2 delay the submission.

Your screenshot shows `ArbiterPanel` tests passing. Keep it as a **bonus trust feature**, not the center of the project. The center is still commerce.

Minimum test list:

```txt
StoaRegistry.t.sol
- register agent
- update metadata
- resolve agent
- reject duplicate invalid registration

ServiceRegistry.t.sol
- list service
- update service
- disable service
- discover service by owner / id

StoaEscrow.t.sol
- create job
- release job
- refund job
- reject unauthorized release
- reject double release
- reject bad token transfer

ArbiterPanel.t.sol
- create case
- vote
- resolve case
- prevent double vote
- enforce arbiter role

MercatorFlow.t.sol
- full register → list → escrow → release → reputation flow
```

Your target:

```txt
pnpm contracts:test
# 70+ tests passing
```

---

## `packages/sdk`

Goal: all chain logic lives here. Skills should be thin wrappers.

Create:

```txt
packages/sdk/src/
├── StoaClient.ts
├── StoaAgent.ts
├── chains.ts
├── addresses.ts
├── abis.ts
├── config.ts
├── errors.ts
├── types.ts
├── contracts/
│   ├── registry.ts
│   ├── escrow.ts
│   ├── services.ts
│   ├── reputation.ts
│   ├── arbiter.ts
│   ├── social.ts
│   └── tipjar.ts
├── treasury/
│   ├── policy.ts
│   ├── guard.ts
│   └── simulate.ts
└── x402/
    ├── client.ts
    ├── server.ts
    └── types.ts
```

The SDK should expose:

```ts
client.registerAgent(...)
client.resolveAgent(...)
client.listService(...)
client.discoverServices(...)
client.createEscrow(...)
client.releaseEscrow(...)
client.refundEscrow(...)
client.writeReputation(...)
client.getReputation(...)
client.guardTransfer(...)
client.payX402(...)
client.createX402Middleware(...)
```

This makes your skills reusable and your code cleaner.

---

## `packages/skills`

Goal: each skill looks professional.

Each skill must have:

```txt
name
similes
description
examples
zod schema
handler
unit test
README section
example script
```

Pharos Agent Kit is a useful reference because its README describes LangChain integration, Zod schema validation, Vercel AI SDK support, MCP support, and viem-based blockchain interactions. Your Stoa skills should look compatible with that ecosystem, but more focused on commerce. ([GitHub][2])

Recommended action shape:

```ts
export const x402PaySkill = {
  name: "x402_pay",
  similes: [
    "pay api",
    "buy paid endpoint",
    "agent payment",
    "http 402 payment",
  ],
  description:
    "Pay an x402-protected endpoint on Pharos with a maxPrice guard.",
  examples: [
    "Pay this x402 endpoint if it costs less than 0.02 USDC",
    "Buy the seller agent's research report",
  ],
  schema,
  handler,
};
```

Your `commerce/index.ts` should export the winning bundle:

```ts
export const stoaCommerceSkills = [
  x402PaySkill,
  x402MonetizeSkill,
  agentIdentitySkill,
  agentEscrowSkill,
  reputationSkill,
  treasuryGuardSkill,
  serviceMarketplaceSkill,
  arbiterPanelSkill,
];
```

---

## `packages/examples`

Goal: judges can run every core feature without reading the code.

Create:

```txt
packages/examples/src/
├── 01-register-agent.ts
├── 02-list-service.ts
├── 03-discover-service.ts
├── 04-create-escrow.ts
├── 05-x402-monetize-server.ts
├── 06-x402-pay-client.ts
├── 07-release-escrow.ts
├── 08-write-reputation.ts
├── 09-treasury-guard-transfer.ts
├── 10-arbiter-dispute.ts
└── 99-full-commerce-loop.ts
```

Most important command:

```bash
pnpm --filter @stoa/examples demo:full
```

---

## `packages/agent-mercator`

Goal: Phase 2 flagship agent, but start it now.

Mercator should be a procurement agent:

```txt
Input:
"Find an agent that can summarize a report for under 0.02 USDC."

Mercator:
1. searches ServiceRegistry,
2. checks identity,
3. checks reputation,
4. creates escrow,
5. pays x402 endpoint,
6. validates output hash,
7. releases escrow,
8. writes reputation.
```

File plan:

```txt
packages/agent-mercator/src/
├── index.ts
├── mercator.ts
├── planner.ts
├── scenario.ts
├── prompts.ts
├── config.ts
├── wallet.ts
├── trace.ts
└── demo/
    ├── buyer.ts
    ├── seller.ts
    ├── helper.ts
    └── full-loop.ts
```

Mercator should use the public skills, not private shortcuts. That proves composability.

---

# 6. Open-source acceleration plan

Use your existing `oss/` folder.

```bash
mkdir -p oss

git clone --depth 1 https://github.com/PharosNetwork/examples oss/pharos-examples
git clone --depth 1 https://github.com/PharosNetwork/pharos-skill-engine oss/pharos-skill-engine
git clone --depth 1 https://github.com/pharos-agent-kit/pharos-agent-kit oss/pharos-agent-kit
git clone --depth 1 https://github.com/x402-foundation/x402 oss/x402
```

Add this to `.gitignore`:

```gitignore
oss/
```

Use them like this:

| Repo                                | How to use it                                                              |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `PharosNetwork/examples`            | Reference Pharos deployment patterns and `skills/x402-pharos`.             |
| `PharosNetwork/pharos-skill-engine` | Reference official skill format and SKILL.md expectations.                 |
| `pharos-agent-kit/pharos-agent-kit` | Reference adapter shape: LangChain, Vercel AI SDK, MCP, Zod, viem.         |
| `x402-foundation/x402`              | Use official x402 SDK packages and examples for buyer/seller payment flow. |

The `PharosNetwork/pharos-skill-engine` repo currently contains `SKILL.md`, `assets`, and `references`, so treat it as a formatting/spec reference rather than a full application template. ([GitHub][3])

Add `NOTICE`:

```txt
Stoa uses and references open-source projects including:

- PharosNetwork/examples — Apache-2.0
- pharos-agent-kit/pharos-agent-kit — Apache-2.0
- x402-foundation/x402 — Apache-2.0

Some implementation patterns are inspired by these projects.
No third-party private keys, secrets, or generated artifacts are included.
```

---

# 7. Immediate sprint plan to win Phase 1

Based on the timeline you pasted, Phase 1 is the urgent one. Execute like this.

## Day 1 — Freeze scope and clean repo

Deliverables:

```txt
README.md rewritten around six commerce skills
docs/HACKATHON_SUBMISSION.md added
docs/DEMO_SCRIPT.md added
packages/skills/src/actions/commerce/ created
packages/sdk basic StoaClient created
contracts test suite green
```

Tasks:

```txt
1. Move flagship skill files into actions/commerce.
2. Add stoaCommerceSkills export.
3. Add one README table for the six skills.
4. Remove or hide unfinished claims.
5. Make root commands work:
   - pnpm build
   - pnpm test
   - pnpm contracts:test
```

Do not polish optional features yet.

---

## Day 2 — Contracts and deployment

Deliverables:

```txt
StoaRegistry deployed
StoaEscrow deployed
ServiceRegistry deployed
ArbiterPanel deployed if stable
pharos-atlantic.json committed
deployment tx hashes documented
```

Tasks:

```txt
1. Finish DeployAtlantic.s.sol.
2. Export ABIs into packages/sdk/src/abis.ts.
3. Add deployments/pharos-atlantic.json.
4. Add contract addresses to .env.example.
5. Add docs/DEPLOYMENT.md.
```

Minimum deployment file:

```json
{
  "network": "pharos-atlantic",
  "chainId": 688689,
  "contracts": {
    "StoaRegistry": "0x...",
    "StoaEscrow": "0x...",
    "ServiceRegistry": "0x...",
    "ArbiterPanel": "0x..."
  }
}
```

---

## Day 3 — Six skills fully usable

Deliverables:

```txt
x402_pay works
x402_monetize works
agent_identity works
agent_escrow works
reputation works
treasury_guard works
unit tests pass
```

Tasks:

```txt
1. Every skill gets a Zod schema.
2. Every skill calls StoaClient.
3. Every skill has one example.
4. Every skill has one test.
5. Generate docs/SKILLS.md.
```

Quality target:

```txt
pnpm --filter @stoa/skills test
# all tests passing
```

---

## Day 4 — Full demo

Deliverables:

```txt
packages/examples/src/99-full-commerce-loop.ts
demo logs with tx hashes
demo output copied into docs/DEMO_SCRIPT.md
```

Tasks:

```txt
1. Register buyer and seller agents.
2. List seller service.
3. Create escrow.
4. Start x402 seller endpoint.
5. Pay endpoint from buyer.
6. Release escrow.
7. Write reputation.
8. Print final summary.
```

Add one command:

```json
{
  "scripts": {
    "demo:full": "tsx src/99-full-commerce-loop.ts"
  }
}
```

---

## Day 5 — Submission polish

Deliverables:

```txt
2-minute demo video
clean README
architecture diagram
submission page
screenshots
test output
deployment addresses
```

Your final README top should have this shape:

```md
# Stoa — The Agent Commerce Stack for Pharos

Stoa gives Pharos agents the missing commerce layer:
x402 payments, on-chain identity, service discovery, escrow, reputation, and treasury safety.

## Try it

pnpm install
pnpm contracts:test
pnpm demo:full

## Flagship skills

...
```

---

# 8. Phase 2 plan: Mercator wins Agent Arena

Phase 2 should not be a different project. It should be the proof that Phase 1 skills compose.

## Week 1 of Phase 2

Build Mercator as a real agent runner.

Deliverables:

```txt
Mercator can choose a service
Mercator can check seller reputation
Mercator can create escrow
Mercator can call x402_pay
Mercator can release escrow
trace logs saved
```

Add:

```txt
packages/agent-mercator/src/trace.ts
```

Trace output:

```json
{
  "runId": "mercator-001",
  "steps": [
    {
      "skill": "agent_identity",
      "tx": "0x...",
      "result": "buyer registered"
    },
    {
      "skill": "service_marketplace",
      "result": "seller selected"
    },
    {
      "skill": "agent_escrow",
      "tx": "0x...",
      "result": "job created"
    }
  ]
}
```

## Week 2 of Phase 2

Make Mercator feel like an actual autonomous economy agent.

Add:

```txt
- simple planner
- budget policy
- seller scoring
- subcontracting flow
- dispute fallback
```

Mercator scoring function:

```txt
score = reputation * 0.45
      + priceFit * 0.25
      + successfulJobs * 0.20
      + responseTime * 0.10
```

## Final Phase 2 demo

Prompt:

```txt
"Mercator, buy a document summary service for less than 0.02 USDC,
prefer sellers with reputation above 4.5, and escrow the job."
```

Output:

```txt
Mercator selected Atlas
Reason: reputation 4.8, price 0.01 USDC, 12 completed jobs
Escrow created
x402 payment completed
Result received
Escrow released
Reputation written
```

That is the full “Agent Arena” story.

---

# 9. Judging matrix

Use this in `HACKATHON.md`.

| Judging criterion   | How Stoa wins                                                           |
| ------------------- | ----------------------------------------------------------------------- |
| Originality         | Most skills are read-only; Stoa enables agent-to-agent commerce.        |
| Technical quality   | Contracts, SDK, typed skills, tests, deployment files, clear ABIs.      |
| Practical use case  | Agents can buy/sell paid API work, escrow jobs, and build reputation.   |
| Reusability         | Six skills are standalone and composable across agents.                 |
| Pharos deployment   | Contracts deployed to Pharos Atlantic, with tx hashes and addresses.    |
| UX/docs             | One-command demo, skill docs, examples, architecture, video.            |
| Ecosystem alignment | Payments, social proof, identity, escrow, and agent economy primitives. |

---

# 10. What to cut

To win, cut anything that does not improve the demo.

Cut or defer:

```txt
- Huge frontend
- Complex tokenomics
- Too many unused contracts
- Unfinished 220-skill marketing
- SubscriptionManager unless already complete
- AgentVault unless already complete
- Streaming unless it appears in the demo
- Deep AI prompt complexity
```

Keep:

```txt
- six commerce skills
- deployed contracts
- one-command demo
- clean docs
- test output
- Mercator proof
```

Judges reward complete, useful, understandable systems.

---

# 11. Exact files to add now

Add these first:

```txt
docs/HACKATHON_SUBMISSION.md
docs/DEMO_SCRIPT.md
docs/WINNING_FLOW.md
packages/skills/src/actions/commerce/index.ts
packages/examples/src/99-full-commerce-loop.ts
packages/sdk/src/StoaClient.ts
packages/sdk/src/addresses.ts
packages/sdk/src/chains.ts
packages/contracts/deployments/pharos-atlantic.json
```

Add this root command:

```json
{
  "scripts": {
    "win": "pnpm test && pnpm contracts:test && pnpm --filter @stoa/examples demo:full"
  }
}
```

The judge-friendly final command becomes:

```bash
pnpm win
```

---

# 12. Demo video script

Use this as your voiceover.

```txt
Stoa is the Agent Commerce Stack for Pharos.

Today, most blockchain agent skills are read-only: check a balance,
read a price, send a transfer. But a real agent economy needs more.

Agents need to discover each other, prove who they are, sell services,
pay other agents, escrow work, protect autonomous spending, and build reputation.

Stoa provides six reusable Pharos skills:
x402_pay, x402_monetize, agent_identity, agent_escrow, reputation, and treasury_guard.

In this demo, Mercator is a buyer agent.
Atlas is a seller agent offering a paid research service.

Mercator discovers Atlas on-chain, checks its identity and reputation,
creates an escrow job, pays Atlas through an x402-protected endpoint,
receives the result, releases escrow, and writes a reputation attestation.

This is the full agent commerce loop:
discover, trust, hire, pay, settle, and rate.

All contracts are deployed on Pharos, all skills are reusable,
and the same skills power the Phase 2 Mercator agent.
```

---

# 13. Final submission checklist

Before submitting, make sure this is true:

```txt
[ ] README explains the project in under 30 seconds.
[ ] Six flagship skills are visible near the top.
[ ] Each skill has schema, handler, example, and test.
[ ] Contracts are deployed and addresses are documented.
[ ] `pnpm contracts:test` passes.
[ ] `pnpm --filter @stoa/skills test` passes.
[ ] `pnpm demo:full` runs.
[ ] Demo prints transaction hashes.
[ ] Demo video exists.
[ ] `NOTICE` credits open-source references.
[ ] `.env.example` has every required variable.
[ ] No private keys are committed.
[ ] Submission page links to GitHub, demo video, docs, and deployment addresses.
```

The winning move is to make Stoa feel like infrastructure Pharos would actually want in its agent ecosystem: **not just another agent, but the reusable payment, identity, escrow, and reputation layer that every future Pharos agent can use.**

[1]: https://github.com/PharosNetwork/examples "GitHub - PharosNetwork/examples: Pharos Examples · GitHub"
[2]: https://github.com/pharos-agent-kit/pharos-agent-kit "GitHub - pharos-agent-kit/pharos-agent-kit: Pharos Agent Kit is a comprehensive toolkit designed to simplify AI agents' interactions with Pharos blockchain · GitHub"
[3]: https://github.com/PharosNetwork/pharos-skill-engine "GitHub - PharosNetwork/pharos-skill-engine · GitHub"
