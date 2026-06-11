# Mercator — the Stoa flagship agent (Phase 2)

Mercator runs the **full agent-to-agent commerce loop** on Pharos using the six Stoa skills.
Every step is a real testnet transaction:

1. **Identity** — Mercator registers in `StoaRegistry`.
2. **Listing** — Mercator lists a paid service behind an x402 paywall (`x402_monetize`).
3. **Discovery & trust** — a buyer agent resolves Mercator and checks its reputation.
4. **Hire** — the buyer funds a milestone escrow (`agent_escrow`).
5. **Subcontract** — to fulfill the job, Mercator itself pays a data provider via `x402_pay`
   (agent paying agent — the value *cascade*).
6. **Settle** — the buyer releases the milestone on delivery.
7. **Rate** — the buyer writes an on-chain reputation attestation.

```
buyer ──hire(escrow)──▶ Mercator ──subcontract(x402)──▶ data provider
  ▲                          │
  └────rate(reputation)──────┘   ◀──release(escrow)──
```

## Run

```bash
# two funded Atlantic testnet keys + deployed Stoa contracts
export MERCATOR_SELLER_KEY=0x...      # Mercator
export MERCATOR_BUYER_KEY=0x...       # the hiring agent
export PHAROS_RPC_URL=https://atlantic.dplabs-internal.com/
export STOA_REGISTRY_ADDRESS=0x...
export STOA_ESCROW_ADDRESS=0x...
export X402_FACILITATOR_URL=https://...   # optional, enables the x402 steps
export SUBCONTRACT_URL=https://...        # optional, an external paid endpoint

pnpm --filter @stoa/agent-mercator start
```

Each step **degrades gracefully**: if a prerequisite (a contract address, the facilitator) is not
configured, that step is skipped with a printed reason instead of aborting the run — so you can
demo incrementally as you wire up infrastructure. At the end Mercator prints every on-chain tx hash
it produced.
