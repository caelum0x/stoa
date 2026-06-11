# @stoa/cli

Run any Stoa skill from the terminal. The CLI auto-exposes every registered skill — no per-command wiring.

## Install / run

```bash
# from the monorepo
pnpm --filter @stoa/cli stoa <SKILL> [args]

# or, after build + global link
stoa <SKILL> [args]
```

## Usage

```bash
stoa list                       # all skills, grouped by domain
stoa list token                 # skills in one domain
stoa describe X402_PAY          # schema + examples for a skill
stoa GET_CHAIN_INFO             # run a skill (no input)
stoa GET_NATIVE_BALANCE address=0xabc...
stoa ERC20_BALANCE token=0xUSDC
stoa X402_PAY '{"url":"https://api.example.com/data","maxPrice":"0.05"}'
```

Inputs accept either `key=value` pairs (values JSON-coerced) or a single JSON blob.

## Environment

| Env | Purpose |
|-----|---------|
| `STOA_PRIVATE_KEY` | agent signer (testnet) |
| `PHAROS_RPC_URL` | RPC (defaults to Pharos Atlantic) |
| `STOA_REGISTRY_ADDRESS` / `STOA_ESCROW_ADDRESS` / `STOA_SERVICES_ADDRESS` | on-chain skills |
| `STOA_SOCIAL_ADDRESS` / `STOA_TIPJAR_ADDRESS` / `STOA_STREAMING_ADDRESS` | social / tipping / streaming |

Exit code is `0` on success, `1` on a skill error or invalid input — so the CLI composes in shell pipelines and CI.
