import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

// Vendored/adapted from pharos-agent-kit (src/tools/dexscreener/get_token_data.ts). Keyless public API.
export const dexscreenerTokenSchema = z.object({
  tokenAddress: addressSchema.describe("Token contract address to look up on DexScreener."),
});

/// SKILL: dexscreener_token — market pairs/price for a token via DexScreener.
export const dexscreenerTokenAction: Action<typeof dexscreenerTokenSchema> = {
  name: "DEXSCREENER_TOKEN",
  similes: ["token market data", "dexscreener", "token pairs", "dex price"],
  description: "Fetch DEX market pairs and pricing for a token address from DexScreener.",
  examples: [
    {
      input: { tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
      output: ok("Fetched token market data", { pairs: [] }),
      explanation: "Reads DEX pairs for a token.",
    },
  ],
  schema: dexscreenerTokenSchema,
  handler: async (_agent, input) => {
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${input.tokenAddress}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return fail(`DexScreener HTTP ${res.status}`);
      const data = (await res.json()) as { pairs?: unknown[] };
      const pairs = Array.isArray(data.pairs) ? data.pairs.slice(0, 10) : [];
      return ok("Fetched token market data", { count: pairs.length, pairs });
    } catch (e) {
      return fail(`dexscreener_token failed: ${errorMessage(e)}`);
    }
  },
};
