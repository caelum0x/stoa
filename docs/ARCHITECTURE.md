# Architecture

Stoa is a layered stack: skills call tools, tools call viem/x402, and value settles on two
purpose-built contracts.

```
            ┌─────────────────────────────────────────────────────────┐
            │  Agent frameworks (LangChain · Vercel AI SDK · MCP)       │
            └───────────────┬─────────────────────────────────────────┘
                            │  adapters/ (createLangchainTools, …)
            ┌───────────────▼─────────────────────────────────────────┐
            │  Skills (actions/)  — the 6 Pharos Agent Kit actions      │
            │  x402_pay · x402_monetize · agent_identity                │
            │  reputation · agent_escrow · treasury_guard               │
            └───────────────┬─────────────────────────────────────────┘
                            │  tools/ (x402 client, monetized server, loadOptional)
            ┌───────────────▼─────────────────────────────────────────┐
            │  StoaAgent (viem publicClient / walletClient / account)   │
            └───────────────┬───────────────────────┬─────────────────┘
                            │ JSON-RPC              │ x402 (HTTP 402)
            ┌───────────────▼──────────┐  ┌─────────▼─────────────────┐
            │ StoaRegistry · StoaEscrow│  │ x402 facilitator / peers   │
            │ (Pharos Atlantic 688689) │  │                            │
            └──────────────────────────┘  └────────────────────────────┘
```

## Design principles

- **One interface, three surfaces.** A skill is defined once as an `Action`. The LangChain,
  Vercel AI, and MCP adapters are thin and generated from the same `actions` array, so there is
  exactly one place to add or change behavior.

- **Pure core, isolated integrations.** Chain access goes through `StoaAgent` (viem). The optional
  payment integrations (`@x402/*`, `express`) are loaded via `loadOptional()` so the package
  type-checks and the non-payment skills run even when those packages are absent.

- **String amounts at the boundary.** Human amounts stay as decimal strings until the last moment,
  where viem's `parseUnits` converts them with the correct token decimals — no float precision loss.

- **Idempotent, explicit results.** Every handler returns `{ status, data, message }` and never
  throws across the boundary; errors are caught and surfaced as `status: "error"`.

## Data flow: a hire-to-settle cycle

1. `agent_identity { op: register }` → `StoaRegistry.register` → `agentId`.
2. `x402_monetize` → local express server guarded by x402 payment middleware → public URL.
3. `agent_escrow { op: create }` → `StoaEscrow.createJob` (funds locked) → `jobId`.
4. `x402_pay` → `@x402/fetch` signs an EIP-3009-style payment → facilitator settles → content.
5. `agent_escrow { op: release }` → `StoaEscrow.release` → milestone paid to worker.
6. `reputation { op: attest }` → `StoaRegistry.attest` → on-chain score.

## Package boundaries

| Package | Responsibility |
|---------|----------------|
| `@stoa/skills` | Skills, adapters, agent context, ABIs. The reusable Phase 1 artifact. |
| `contracts` | Solidity + tests + deploy. The settlement layer. |
| `@stoa/agent-mercator` | Phase 2 orchestration of the skills into a full agent. |
| `@stoa/examples` | Minimal, copy-pasteable usage per skill. |
