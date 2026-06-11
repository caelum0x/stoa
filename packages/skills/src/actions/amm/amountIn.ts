import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const ammAmountInSchema = z.object({
  amountOut: baseUnitsSchema.describe("Desired output token amount, base units."),
  reserveIn: baseUnitsSchema.describe("Reserve of the input token, base units."),
  reserveOut: baseUnitsSchema.describe("Reserve of the output token, base units."),
});

/// SKILL: amm_amount_in — Uniswap-v2 getAmountIn with the 0.3% fee.
export const ammAmountInAction: Action<typeof ammAmountInSchema> = {
  name: "AMOUNT_IN",
  similes: ["amount in", "get amount in", "swap input", "uniswap v2 amount in"],
  description: "Compute the Uniswap-v2 input amount required for a desired output and reserves (0.3% fee). No network access.",
  examples: [
    {
      input: { amountOut: "1993", reserveIn: "1000000", reserveOut: "2000000" },
      output: ok("Amount in", { amountIn: "1000" }),
      explanation: "Computes the input needed to receive 1993 base units.",
    },
  ],
  schema: ammAmountInSchema,
  handler: async (_agent, input) => {
    try {
      const amountOut = BigInt(input.amountOut);
      const reserveIn = BigInt(input.reserveIn);
      const reserveOut = BigInt(input.reserveOut);
      if (amountOut <= 0n) return fail("amount_in failed: amountOut must be > 0");
      if (reserveIn <= 0n || reserveOut <= 0n) return fail("amount_in failed: reserves must be > 0");
      if (amountOut >= reserveOut) return fail("amount_in failed: amountOut must be < reserveOut");
      const numerator = reserveIn * amountOut * 1000n;
      const denominator = (reserveOut - amountOut) * 997n;
      const amountIn = numerator / denominator + 1n;
      return ok("Amount in", {
        amountOut: input.amountOut,
        reserveIn: input.reserveIn,
        reserveOut: input.reserveOut,
        amountIn: amountIn.toString(),
      });
    } catch (e) {
      return fail(`amount_in failed: ${errorMessage(e)}`);
    }
  },
};
