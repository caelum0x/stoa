# Security model

The Pharos hackathon uses the **CertiK Skill Scanner** as its official security standard. Stoa is
architected to pass it cleanly and to be safe for autonomous, money-moving agents.

## CertiK-driven constraints

The scanner flags malicious behavior, data leakage, unauthorized network access, shell execution,
and filesystem abuse. Stoa skills therefore:

- **Never execute shells or touch the filesystem.** No `child_process`, no `fs` in the skill paths.
- **Make no unauthorized network calls.** Egress is limited to (a) the configured Pharos RPC and
  (b) the exact x402 URL the caller passes. There is no telemetry or phone-home.
- **Never read or log secrets.** Private keys come from env via `StoaAgent`; they are never
  logged, serialized, or returned in any `ActionResult`.
- **Declare optional integrations explicitly.** `@x402/*` and `express` are loaded through
  `loadOptional()`, which fails with a clear message rather than pulling code implicitly.

## Spending safety

- **`treasury_guard`** gates value transfers behind an allowlist, a per-tx ceiling, a rolling 24h
  cap, and a **simulate-before-send** preflight. Spend is recorded only after a successful
  broadcast.
- **`x402_pay`** reads the 402 quote and aborts before paying if it exceeds `maxPrice`.

## Contract safety

- Checks-effects-interactions ordering and a minimal non-reentrancy guard on every payout path.
- No external imports in `src/` — smaller audit surface, hermetic builds.
- `StoaEscrow`: up-front funding, per-milestone release, no self-dealing, no zero milestones.
- `StoaRegistry`: no self-attestation, one attestation per address, bounded scores.

## Operational guidance

- Use **dedicated testnet keys** for agents. Never put a funded mainnet key in an agent's env.
- Set `STOA_GUARD_*` policy variables in production so even a compromised prompt cannot exceed
  your spend limits.
- Treat the CertiK scan as a pre-submission gate; re-run it after any change to a skill handler.
