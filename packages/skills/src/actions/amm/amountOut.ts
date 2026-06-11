import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const ammAmountOutSchema = z.object({
  amountIn: baseUnitsSchema.describe("Input token amount, base units."),
  reserveIn: baseUnitsSchema.describe("Reserve of the input token, base units."),
  reserveOut: baseUnitsSchema.describe("Reserve of the output token, base units."),
});

/// SKILL: amm_amount_out — Uniswap-v2 getAmountOut with the 0.3% fee.
export const ammAmountOutAction: Action<typeof ammAmountOutSchema> = {
  name: "AMOUNT_OUT",
  similes: ["amount out", "get amount out", "swap output", "uniswap v2 amount out"],
  description: "Compute the Uniswap-v2 output amount for a given input and reserves (0.3% fee). No network access.",
  examples: [
    {
      input: { amountIn: "1000", reserveIn: "1000000", reserveOut: "2000000" },
      output: ok("Amount out", { amountOut: "1993" }),
      explanation: "Computes the output for swapping 1000 base units.",
    },
  ],
  schema: ammAmountOutSchema,
  handler: async (_agent, input) => {
    try {
      const amountIn = BigInt(input.amountIn);
      const reserveIn = BigInt(input.reserveIn);
      const reserveOut = BigInt(input.reserveOut);
      if (amountIn <= 0n) return fail("amount_out failed: amountIn must be > 0");
      if (reserveIn <= 0n || reserveOut <= 0n) return fail("amount_out failed: reserves must be > 0");
      const amountInWithFee = amountIn * 997n;
      const numerator = amountInWithFee * reserveOut;
      const denominator = reserveIn * 1000n + amountInWithFee;
      const amountOut = numerator / denominator;
      return ok("Amount out", {
        amountIn: input.amountIn,
        reserveIn: input.reserveIn,
        reserveOut: input.reserveOut,
        amountOut: amountOut.toString(),
      });
    } catch (e) {
      return fail(`amount_out failed: ${errorMessage(e)}`);
    }
  },
};
