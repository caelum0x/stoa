import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const slippageMinOutSchema = z.object({
  amount: baseUnitsSchema.describe("Expected output in base units, as a string."),
  slippageBps: z.coerce
    .number()
    .int()
    .min(0)
    .max(10000)
    .describe("Allowed slippage in basis points (1 bps = 0.01%)."),
});

/// SKILL: slippage_min_out — minimum acceptable output after slippage tolerance.
export const slippageMinOutAction: Action<typeof slippageMinOutSchema> = {
  name: "SLIPPAGE_MIN_OUT",
  similes: ["min out", "minimum amount out", "slippage floor", "amountOutMin"],
  description: "Compute amount * (10000 - slippageBps) / 10000 using exact bigint math. No network access.",
  examples: [
    {
      input: { amount: "1000000", slippageBps: 50 },
      output: ok("Min out", { result: "995000" }),
      explanation: "0.50% slippage applied to 1,000,000 base units.",
    },
  ],
  schema: slippageMinOutSchema,
  handler: async (_agent, input) => {
    try {
      const amount = BigInt(input.amount);
      const factor = BigInt(10000 - input.slippageBps);
      const result = ((amount * factor) / 10000n).toString();
      return ok("Min out", { amount: input.amount, slippageBps: input.slippageBps, result });
    } catch (e) {
      return fail(`slippage_min_out failed: ${errorMessage(e)}`);
    }
  },
};
