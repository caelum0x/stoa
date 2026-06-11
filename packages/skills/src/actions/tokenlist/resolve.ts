import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { KNOWN_TOKENS } from "./registry.js";

export const resolveTokenSchema = z.object({
  symbol: z.string().min(1).describe("Token symbol to resolve, e.g. \"USDC\" (case-insensitive)."),
});

/// SKILL: resolve_token — resolve a token symbol to its on-chain metadata.
export const resolveTokenAction: Action<typeof resolveTokenSchema> = {
  name: "RESOLVE_TOKEN",
  similes: ["resolve token", "token address", "lookup token", "find token"],
  description: "Resolve a token symbol (case-insensitive) to its address, decimals, and name from the known-token registry.",
  examples: [
    {
      input: { symbol: "usdc" },
      output: ok("Resolved USDC", {
        symbol: "USDC",
        address: "0xE0BE08c77f415F577A1B3A9aD7a1Df1479564ec8",
        decimals: 6,
        name: "USD Coin (test)",
      }),
      explanation: "Looks up USDC case-insensitively in the registry.",
    },
  ],
  schema: resolveTokenSchema,
  handler: async (_agent, input) => {
    try {
      const wanted = input.symbol.trim().toUpperCase();
      const token = KNOWN_TOKENS[wanted];
      if (token === undefined) {
        const available = Object.keys(KNOWN_TOKENS).join(", ");
        return fail(`resolve_token failed: unknown token "${input.symbol}". Known: ${available}`);
      }
      return ok(`Resolved ${wanted}`, {
        symbol: wanted,
        address: token.address,
        decimals: token.decimals,
        name: token.name,
      });
    } catch (e) {
      return fail(`resolve_token failed: ${errorMessage(e)}`);
    }
  },
};
