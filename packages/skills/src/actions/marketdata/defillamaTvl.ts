import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

// Vendored/adapted from pharos-agent-kit (src/tools/defillama/get_protocol_tvl.ts).
// Keyless public API; the Fuse.js fuzzy slug matching was dropped to keep the skill dependency-free.
const DEFILLAMA_BASE_URL = "https://api.llama.fi";

export const defillamaTvlSchema = z.object({
  protocol: z.string().min(1).describe('DeFiLlama protocol slug, e.g. "aave", "uniswap", "lido".'),
});

/// SKILL: defillama_protocol_tvl — total value locked for a DeFi protocol.
export const defillamaTvlAction: Action<typeof defillamaTvlSchema> = {
  name: "DEFILLAMA_PROTOCOL_TVL",
  similes: ["protocol tvl", "total value locked", "defi tvl", "how much locked"],
  description: "Fetch the current Total Value Locked (USD) for a DeFi protocol from DeFiLlama.",
  examples: [
    {
      input: { protocol: "aave" },
      output: ok("Fetched protocol TVL", { protocol: "aave", tvlUsd: 0 }),
      explanation: "Reads Aave's current TVL.",
    },
  ],
  schema: defillamaTvlSchema,
  handler: async (_agent, input) => {
    try {
      const res = await fetch(`${DEFILLAMA_BASE_URL}/tvl/${encodeURIComponent(input.protocol)}`);
      if (!res.ok) return fail(`DeFiLlama HTTP ${res.status} (unknown protocol slug?)`);
      const value = await res.json();
      return ok("Fetched protocol TVL", { protocol: input.protocol, tvlUsd: Number(value) });
    } catch (e) {
      return fail(`defillama_protocol_tvl failed: ${errorMessage(e)}`);
    }
  },
};
