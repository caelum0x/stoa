# Deployment

## 0. Prerequisites

- Node ≥ 20, pnpm ≥ 9, Foundry.
- One or two funded **Pharos Atlantic testnet** keys (PHRS for gas). Use the faucet linked from
  the Pharos docs.

## 1. Install

```bash
pnpm install
```

## 2. Deploy the contracts

```bash
cp .env.example .env       # set PRIVATE_KEY (testnet)
pnpm contracts:test        # 15 tests should pass
pnpm contracts:deploy      # deploys StoaRegistry + StoaEscrow to Atlantic
```

Copy the two printed addresses into `.env`:

```
STOA_REGISTRY_ADDRESS=0x...
STOA_ESCROW_ADDRESS=0x...
```

## 3. Build & test the skills

```bash
pnpm --filter @stoa/skills test
pnpm build
```

## 4. (Optional) enable the x402 payment skills

Install the payment integrations and point at a facilitator:

```bash
pnpm add -w @x402/fetch @x402/evm @x402/core @x402/express express
export X402_FACILITATOR_URL=https://<facilitator>
```

## 5. Run the MCP server

```bash
STOA_PRIVATE_KEY=0x... STOA_REGISTRY_ADDRESS=0x... STOA_ESCROW_ADDRESS=0x... \
  pnpm --filter @stoa/skills mcp
```

Point any MCP client (Claude Desktop, etc.) at the command above to expose all six skills.

## 6. Run the flagship agent

```bash
pnpm --filter @stoa/agent-mercator start
```

## Chain reference

| | |
|---|---|
| Network | Pharos Atlantic Testnet |
| Chain id | `688689` |
| RPC | `https://atlantic.dplabs-internal.com/` |
| Native token | PHRS |
| Test USDC | `0xE0BE08c77f415F577A1B3A9aD7a1Df1479564ec8` |
