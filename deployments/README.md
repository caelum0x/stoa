# Deployments

One JSON manifest per network holds every Stoa contract address, so agents load them in one shot
instead of juggling ten environment variables.

## Use

```ts
import { readFileSync } from "node:fs";
import { StoaAgent, parseManifest } from "@stoa/skills";

const manifest = parseManifest(readFileSync("deployments/atlantic.json", "utf8"));
const agent = StoaAgent.fromManifest(manifest, { privateKey: process.env.STOA_PRIVATE_KEY as `0x${string}` });
// agent.contracts is now fully populated; placeholder/invalid addresses are dropped.
```

## Populate

1. `pnpm contracts:deploy` — prints each deployed address in the run summary.
2. Copy `atlantic.example.json` to `atlantic.json` and paste the addresses in.

`manifestToContracts` validates each entry against the 20-byte address format and silently drops
placeholders (`"0x..."`), so a half-filled manifest fails loudly at the point of use (via
`requireContract`) rather than sending to a wrong address.
