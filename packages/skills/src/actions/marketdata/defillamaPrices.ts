import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

// Vendored/adapted from pharos-agent-kit (src/tools/defillama/fetch_price.ts). Keyless public API.
const DEFILLAMA_PRICES_URL = "https://coins.llama.fi";

export const defillamaPricesSchema = z.object({
  tokens: z
    .array(z.string())
    .min(1)
    .max(50)
    .describe('Tokens in "chain:address" form, e.g. "ethereum:0x0000...000".'),
  searchWidth: z.string().optional().describe('Price search window (default "6h").'),
});

/// SKILL: defillama_prices — current USD prices for tokens from DeFiLlama.
export const defillamaPricesAction: Action<typeof defillamaPricesSchema> = {
  name: "DEFILLAMA_PRICES",
  similes: ["token price", "defillama price", "usd price", "offchain price"],
  description: "Fetch current USD prices for tokens from DeFiLlama using \"chain:address\" identifiers.",
  examples: [
    {
      input: { tokens: ["ethereum:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"] },
      output: ok("Fetched token prices", { coins: {} }),
      explanation: "Reads USDC's USD price from DeFiLlama.",
    },
  ],
  schema: defillamaPricesSchema,
  handler: async (_agent, input) => {
    try {
      const params = new URLSearchParams();
      if (input.searchWidth) params.set("searchWidth", input.searchWidth);
      const url = `${DEFILLAMA_PRICES_URL}/prices/current/${input.tokens.join(",")}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) return fail(`DeFiLlama HTTP ${res.status}`);
      const data = (await res.json()) as { coins?: Record<string, unknown> };
      return ok("Fetched token prices", { coins: data.coins ?? data });
    } catch (e) {
      return fail(`defillama_prices failed: ${errorMessage(e)}`);
    }
  },
};
