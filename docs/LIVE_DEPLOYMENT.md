# Live Deployment

## Project URLs

GitHub repository: `https://github.com/caelum0x/stoa`

Vercel production deployment:

- `https://pharos-7qxc3odaf-arhansubas-projects.vercel.app`

Vercel aliases:

- `https://pharos-fawn-psi.vercel.app`
- `https://pharos-arhansubas-projects.vercel.app`
- `https://pharos-arhansuba-arhansubas-projects.vercel.app`

Vercel inspect:

- `https://vercel.com/arhansubas-projects/pharos/7yYmWnYbEzZY1dekqYGLCjFtzTiv`

Deployment-protection note: this Vercel project currently has deployment protection enabled. The
deployment is ready and verified through authenticated `vercel curl`; disable Production
Deployment Protection in Vercel before sharing with unauthenticated judges.

Useful app routes:

| Route | Purpose |
|---|---|
| `/` | product entry |
| `/api/contracts` | JSON list of live contract addresses |
| `/marketplace` | live services from `ServiceRegistry` |
| `/agents` | live agents from `StoaRegistry` |
| `/dashboard` | service listing, escrow jobs, release, rate |
| `/social` | posts and tipping |
| `/contracts` | Streaming, subscriptions, vault, dispute, RWA, value reputation |
| `/protected` | x402 paid API demo |
| `/playground` | skill playground |

## Network

Network: Pharos Atlantic Testnet  
Chain id: `688689`  
RPC: `https://atlantic.dplabs-internal.com/`  
Deployer: `0xd5906A7DDA28924309334d53f5bF117Fe809335f`

## Contracts

| Contract | Address |
|---|---|
| StoaRegistry | `0xc2c90f0081fc4c78825c6d226cc0084a8e63d3c9` |
| StoaEscrow | `0x7b1cbb4f0b830908bff2fefbbbdb0496fdb695c0` |
| ServiceRegistry | `0x357340149b6e1e3819f7cc31eb2781945f53c119` |
| SocialFeed | `0x02f4130b3fae87085bf4df2ac8ed8278a0cc1bcc` |
| TipJar | `0x4aa3557767da7cff09ab7011b1bc93182ff2d73a` |
| Streaming | `0x6099e77db6742e4be564ad68cc48a12dc13244f4` |
| Faucet | `0xb6d05ced82553b5cf371238d1fa25535f4e69568` |
| SessionKeyManager | `0xda5fc3ed11833666c836e71200b3b35be852f666` |
| SubscriptionManager | `0x048dd723ad55b3add145e41b4aeebe122e4dc8f2` |
| AgentVault | `0x9bcd5b2da64dc41812c8c639ef013674dc67e901` |
| ArbiterPanel | `0x6e156e652898c7923af178672be598e382beee12` |
| RwaRegistry | `0x8cb6ae16b0da476bd87618b223e2062ddb06d038` |
| ValueReputation | `0x7a42ee304b5d07d4886ee37b65b641f154871ef0` |

JSON manifest:

- `deployments/pharos-atlantic.json`
- `packages/contracts/deployments/pharos-atlantic.json`

## Seed Proof

Seed transaction hashes:

- Agent registration: `0x6bd65311b9497f6cbff07349646de904a11d06c5b72512f345263fe681a85ba9`
- Service listing: `0xf4723efdd0133f78ab08b0958982c1ac90719e6d1bb887380271705421f62958`
- Social post: `0x82b447ae45ac6e202cb9aa409693c9a4e9b047f84fe3e407b42d9a59e8520971`

Verify live bytecode and seeded counters:

```bash
pnpm verify:live
```

Expected verification summary:

```text
pharos-atlantic · chain 688689
seed agents=1
seed services=1
seed posts=1
```

## Build And Test Proof

```bash
pnpm verify:live
pnpm contracts:test
pnpm --filter @stoa/skills test
pnpm build
```

Current local verification:

- `pnpm verify:live` passes; all 13 contracts have bytecode.
- `pnpm contracts:test` passes.
- `pnpm --filter @stoa/skills test` passes.
- `pnpm build` passes.

## Submission Fields

Project name: `Stoa`  
One-line pitch: `The Agent Commerce Stack for Pharos: discover, trust, hire, pay, settle, and rate autonomous agents on-chain.`  
Repository: `https://github.com/caelum0x/stoa`  
Demo URL: `https://pharos-7qxc3odaf-arhansubas-projects.vercel.app`  
Network: `Pharos Atlantic Testnet`  
Chain id: `688689`  
Deployed-address proof: use the contract table above or `deployments/pharos-atlantic.json`.
