# Hackathon Submission Checklist

The final pre-submission gate for **Stoa — The Agent Commerce Stack for Pharos**. Every box must be
green before submitting to the Pharos Skill-to-Agent Dual Cascade Hackathon.

## Documentation & story

- [ ] **README is clear** — a judge understands the project (the `discover → trust → hire → pay →
      settle → rate` loop) within the first screen.
- [ ] **Six+ flagship skills are visible** — the commerce skills (`x402_pay`, `x402_monetize`,
      `agent_identity`, `reputation`, `agent_escrow`, `treasury_guard`, plus `service_listing`) are
      front-and-center in the README and `SUBMISSION.md`, not buried under the utility toolkit.
- [ ] **[HACKATHON.md](../HACKATHON.md), [WINNING_FLOW.md](WINNING_FLOW.md), and
      [DEMO_SCRIPT.md](DEMO_SCRIPT.md)** are linked from `SUBMISSION.md` and the README.

## Skills quality

- [ ] **Each flagship skill has a schema** — a schema-validated input contract.
- [ ] **Each flagship skill has a handler** — a working implementation.
- [ ] **Each flagship skill has an example** — at least one entry in its `examples` array and a
      runnable demo under `packages/examples`.
- [ ] **Each flagship skill has a test** — covered by the skills test suite.
- [ ] **`pnpm --filter @stoa/skills test` passes** — all skills tests green.

## Contracts

- [ ] **All 13 contracts are deployed** to Pharos Atlantic (chain `688689`): `StoaRegistry`,
      `StoaEscrow`, `ServiceRegistry`, `SocialFeed`, `TipJar`, `Streaming`, `Faucet`,
      `SessionKeyManager`, `SubscriptionManager`, `AgentVault`, `ArbiterPanel`, `RwaRegistry`,
      `ValueReputation`.
- [ ] **Deployed addresses are recorded** — `deployments/pharos-atlantic.json` has real `0x...`
      addresses for all 13 contracts (not placeholders).
- [ ] **`pnpm contracts:test` passes** — the full offline Foundry suite is green.
- [ ] **Demo data is seeded** — run `pnpm seed:live` after deploy so marketplace, agents, and
      social pages read from live chain state.

## The demo

- [ ] **The web app builds** — `pnpm --filter @stoa/web build` passes and includes the `/contracts`
      page for Streaming, SubscriptionManager, AgentVault, ArbiterPanel, RwaRegistry, and
      ValueReputation.
- [ ] **`pnpm demo:full` runs end-to-end** — the full commerce loop in one command.
- [ ] **The demo prints transaction hashes** — every value-moving step is a real Pharos tx, with the
      hash echoed to the console.
- [ ] **`pnpm win` runs the full gauntlet** — skills tests + contracts tests + demo, all green.

## Provenance & secrets

- [ ] **`NOTICE` credits OSS** — all open-source dependencies and standards (x402, ERC-8004,
      Foundry, etc.) are credited.
- [ ] **`.env.example` is complete** — every required variable (`PRIVATE_KEY`, `STOA_PRIVATE_KEY`,
      `PHAROS_RPC_URL`, ...) is listed with a placeholder.
- [ ] **No private keys committed** — repo history and the working tree contain no real keys,
      mnemonics, or secrets; only `.env.example` placeholders.

## Human-only submission artifacts

- [ ] **2-minute demo video** — show the live deploy manifest, dApp wallet flow, marketplace,
      dashboard, social/tipping, skill playground, x402 route, and `/contracts`.
- [ ] **Screenshots** — homepage, marketplace, agents, dashboard, social, activity, skills,
      playground, x402 paid API, and `/contracts`.
- [ ] **Pharos explorer proof** — open each deployed address from `deployments/pharos-atlantic.json`.
- [ ] **CertiK Skill Scanner** — run the official scanner and attach the result.
- [ ] **DoraHacks form** — paste repo, demo URL, video URL, deployed addresses, and scanner proof.

## Network reference

| | |
|---|---|
| Network | Pharos Atlantic Testnet |
| Chain id | `688689` (CAIP-2 `eip155:688689`) |
| RPC | `https://atlantic.dplabs-internal.com/` |
| Native token | PHRS |
