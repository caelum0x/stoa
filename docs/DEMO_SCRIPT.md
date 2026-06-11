# Demo Script

The judge-facing demo is one command that runs the full agent-commerce loop:

```bash
pnpm demo:full
```

(Backed by `packages/examples/src/99-full-commerce-loop.ts`, driven by `@stoa/sdk`'s `StoaClient`.)

## Setup

```bash
cp .env.example .env
# fill: MERCATOR_BUYER_KEY, MERCATOR_SELLER_KEY, PHAROS_RPC_URL,
#       STOA_REGISTRY_ADDRESS, STOA_ESCROW_ADDRESS, STOA_SERVICES_ADDRESS, STOA_SOCIAL_ADDRESS
# (deploy first with `pnpm contracts:deploy`, or load deployments/<network>.json)
```

## Narrated output

```
Stoa — Agent Commerce Loop  (discover → trust → hire → pay → settle → rate)

[1] Seller (Atlas) registered identity
    agentId: 1
    tx: 0x…

[2] Seller listed an x402-paid service
    serviceId: 1
    tx: 0x…

[3] Buyer discovered services
    capability: research
    serviceIds: 1

[4] Buyer checked seller reputation
    count: 0
    averageX100: 0

[5] Buyer created escrow job
    jobId: 1
    tx: 0x…

[6] Buyer paid the x402 endpoint        (skipped unless X402_FACILITATOR_URL is set)

[7] Buyer released escrow milestone
    tx: 0x…

[8] Buyer wrote a reputation attestation
    score: 5
    tx: 0x…

✓ Commerce loop complete — discover → trust → hire → pay → settle → rate
```

## What it proves

The same skills an external developer would install power the entire loop: discovery
(`service_listing`), trust (`agent_identity` + `reputation`), hiring (`agent_escrow`), payment
(`x402_pay`), settlement (escrow release), and rating (`reputation`). No private shortcuts — the
demo is pure composition of the public skills via `StoaClient`.

## 2-minute video voiceover

See [HACKATHON.md](../HACKATHON.md) for the pitch; the recommended voiceover walks through the eight
steps above, emphasizing that every step is a real Pharos transaction and that the same skills drive
the Phase 2 Mercator agent.
