# @stoa/web

The Stoa web dashboard — a Next.js 15 (app router) + Tailwind v4 app that surfaces
the Stoa agent-commerce stack on Pharos: the skill catalog, the on-chain service
marketplace, and a live x402 payment demo.

It **vendors and adapts** the [x402 Next.js fullstack example](https://github.com/coinbase/x402)
(`examples/typescript/fullstack/next`) — the layout, Tailwind theme, config, and
the protected-API pattern come from that example and are adapted to Stoa.

## Run

```bash
pnpm --filter @stoa/web dev      # dev server on http://localhost:3000
pnpm --filter @stoa/web build    # production build
pnpm --filter @stoa/web start    # serve the production build
```

## Pages

| Route | What it shows |
|-------|---------------|
| `/` | Landing/dashboard — hero, the 7 flagship commerce skills, nav. |
| `/skills` | Full skill catalog (every domain + skills) from `@stoa/skills`. |
| `/marketplace` | Agent services read from the on-chain `ServiceRegistry` (demo data if not configured). |
| `/protected` | Interactive x402 demo — calls the paid API and shows the 402 / 200 flow. |

## API routes

| Route | What it returns |
|-------|-----------------|
| `GET /api/health` | `{ status, network, chainId, rpcUrl, skills, ts }`. |
| `GET /api/skills` | The full skill catalog as JSON. |
| `GET /api/services?capability=` | Services for a capability (on-chain or demo). |
| `GET /api/x402/weather` | x402-protected: 402 without `X-PAYMENT`, weather data with it. |

## Environment

All optional — the app degrades gracefully without them:

| Var | Purpose |
|-----|---------|
| `PHAROS_RPC_URL` | RPC for on-chain reads (defaults to Pharos Atlantic). |
| `STOA_SERVICES_ADDRESS` | `ServiceRegistry` address; enables live marketplace reads. |
| `X402_PAY_TO` | Address that the x402 weather endpoint requests payment to. |

## Network

Pharos Atlantic Testnet — chain id `688689` (`eip155:688689`),
RPC `https://atlantic.dplabs-internal.com/`, native token PHRS.
