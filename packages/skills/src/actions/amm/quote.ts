import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const ammQuoteSchema = z.object({
  amountA: baseUnitsSchema.describe("Amount of token A, base units."),
  reserveA: baseUnitsSchema.describe("Reserve of token A, base units."),
  reserveB: baseUnitsSchema.describe("Reserve of token B, base units."),
});

/// SKILL: amm_quote — Uniswap-v2 quote: equivalent amount of B for amount A (fee-free, pro-rata).
export const ammQuoteAction: Action<typeof ammQuoteSchema> = {
  name: "QUOTE",
  similes: ["quote", "uniswap v2 quote", "equivalent amount", "pro rata amount"],
  description: "Compute the Uniswap-v2 pro-rata equivalent amount of token B for a given amount of token A. No network access.",
  examples: [
    {
      input: { amountA: "1000", reserveA: "1000000", reserveB: "2000000" },
      output: ok("Quote", { amountB: "2000" }),
      explanation: "Computes the equivalent amount of B for 1000 of A.",
    },
  ],
  schema: ammQuoteSchema,
  handler: async (_agent, input) => {
    try {
      const amountA = BigInt(input.amountA);
      const reserveA = BigInt(input.reserveA);
      const reserveB = BigInt(input.reserveB);
      if (amountA <= 0n) return fail("quote failed: amountA must be > 0");
      if (reserveA <= 0n || reserveB <= 0n) return fail("quote failed: reserves must be > 0");
      const amountB = (amountA * reserveB) / reserveA;
      return ok("Quote", {
        amountA: input.amountA,
        reserveA: input.reserveA,
        reserveB: input.reserveB,
        amountB: amountB.toString(),
      });
    } catch (e) {
      return fail(`quote failed: ${errorMessage(e)}`);
    }
  },
};
