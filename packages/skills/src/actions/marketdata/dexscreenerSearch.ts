import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

// Vendored/adapted from pharos-agent-kit (src/tools/dexscreener/get_token_data.ts search helper).
export const dexscreenerSearchSchema = z.object({
  query: z.string().min(1).describe("Ticker or name to search, e.g. \"USDC\" or \"PROS\"."),
});

interface DexPair {
  chainId?: string;
  dexId?: string;
  priceUsd?: string;
  fdv?: number;
  baseToken?: { symbol?: string; address?: string };
}

/// SKILL: dexscreener_search — search DEX pairs by ticker/name via DexScreener.
export const dexscreenerSearchAction: Action<typeof dexscreenerSearchSchema> = {
  name: "DEXSCREENER_SEARCH",
  similes: ["search token", "find token", "dexscreener search", "token by ticker"],
  description: "Search DexScreener for DEX pairs matching a ticker or name; returns the top matches by FDV.",
  examples: [
    {
      input: { query: "USDC" },
      output: ok("Searched DEX pairs", { count: 10 }),
      explanation: "Finds DEX pairs for USDC.",
    },
  ],
  schema: dexscreenerSearchSchema,
  handler: async (_agent, input) => {
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(input.query)}`);
      if (!res.ok) return fail(`DexScreener HTTP ${res.status}`);
      const data = (await res.json()) as { pairs?: DexPair[] };
      const pairs = Array.isArray(data.pairs) ? data.pairs : [];
      const top = [...pairs]
        .sort((a, b) => (b.fdv ?? 0) - (a.fdv ?? 0))
        .slice(0, 10)
        .map((p) => ({
          chainId: p.chainId,
          dexId: p.dexId,
          symbol: p.baseToken?.symbol,
          address: p.baseToken?.address,
          priceUsd: p.priceUsd,
          fdv: p.fdv,
        }));
      return ok("Searched DEX pairs", { count: top.length, pairs: top });
    } catch (e) {
      return fail(`dexscreener_search failed: ${errorMessage(e)}`);
    }
  },
};
