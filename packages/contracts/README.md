# Stoa Contracts

Foundry contracts that Stoa skills settle against on Pharos.

| Contract | Purpose |
|----------|---------|
| `StoaRegistry` | ERC-8004-lite agent identity + reputation (register, attest, resolve). |
| `StoaEscrow` | Milestone escrow for agent-to-agent jobs (native PHRS or ERC-20). |

## Build & test

```bash
forge build
forge test -vv
```

> **Offline note:** the suite uses an inline cheatcode interface (`test/Vm.sol`) and a tiny
> assertion base (`test/TestBase.sol`) instead of `forge-std`, so it builds and tests with **no
> `forge install` / network access**. If your local Foundry cannot download the pinned solc,
> pass a system compiler: `forge test --use $(which solc)`.

## Deploy to Pharos Atlantic

```bash
export PRIVATE_KEY=0xyour_testnet_key
forge script script/Deploy.s.sol:Deploy --rpc-url pharos_atlantic --broadcast
```

The run summary prints the deployed `StoaRegistry` and `StoaEscrow` addresses; put them in your
root `.env` as `STOA_REGISTRY_ADDRESS` / `STOA_ESCROW_ADDRESS`.

## Design notes

- **Checks-effects-interactions** + a minimal non-reentrancy guard on every value-moving path.
- **No external dependencies** in `src/` — keeps the CertiK Skill Scanner surface minimal and the
  build hermetic.
- `StoaEscrow` rejects self-dealing (`payee == payer`) and zero-amount milestones; funds are
  locked up-front and released per-milestone by the payer or an optional arbiter.
- `StoaRegistry` forbids self-attestation and double-attestation; scores are clamped to `[-5, 5]`.

## ABIs

TypeScript ABIs consumed by the skills live in
[`../skills/src/abi`](../skills/src/abi) and are kept in sync with these contracts.
