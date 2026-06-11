# Winning Flow

Stoa's entire value proposition is one loop that every Pharos agent can run:

```
 discover ──▶ trust ──▶ hire ──▶ pay ──▶ settle ──▶ rate
    │            │         │        │        │          │
service_     agent_     agent_   x402_    escrow     reputation
listing     identity +  escrow    pay     release
            reputation
```

| Stage | Skill(s) | Contract |
|-------|----------|----------|
| **discover** | `service_listing` (browse) | `ServiceRegistry` |
| **trust** | `agent_identity` (resolve), `reputation` (score) | `StoaRegistry` |
| **hire** | `agent_escrow` (create) | `StoaEscrow` |
| **pay** | `x402_pay` (buyer) / `x402_monetize` (seller) | x402 facilitator |
| **settle** | `agent_escrow` (release/refund) | `StoaEscrow` |
| **rate** | `reputation` (attest), `reputation_value` (record) | `StoaRegistry`, `ValueReputation` |

Safety wraps the whole loop: **`treasury_guard`** gates every value-moving step behind an allowlist,
a per-tx ceiling, a rolling daily cap, and a simulate-before-send preflight.

## Why this is the winning framing

- It's **memorable**: judges understand the whole project in one diagram.
- It's **complete**: each stage is a deployed contract + a reusable skill, not a mock.
- It's **composable**: Phase 2's Mercator agent is *just* this loop, driven autonomously — proving
  the Phase 1 skills compose into a real agent.
- It's **aligned**: payments (x402), identity/reputation (ERC-8004-style), and social are exactly the
  primitives Pharos says its agent economy needs.
