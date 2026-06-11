import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const applyBpsSchema = z.object({
  amount: baseUnitsSchema.describe("Integer amount in base units, as a string."),
  bps: z.coerce.number().int().min(0).describe("Basis points to apply (1 bps = 0.01%)."),
});

/// SKILL: apply_bps — multiply a base-unit amount by a basis-point fraction.
export const applyBpsAction: Action<typeof applyBpsSchema> = {
  name: "APPLY_BPS",
  similes: ["apply basis points", "apply bps", "fee in bps", "percentage of amount"],
  description: "Compute amount * bps / 10000 using exact bigint math. No network access.",
  examples: [
    {
      input: { amount: "1000000", bps: 30 },
      output: ok("Applied bps", { result: "3000" }),
      explanation: "30 bps (0.30%) of 1,000,000 base units.",
    },
  ],
  schema: applyBpsSchema,
  handler: async (_agent, input) => {
    try {
      const amount = BigInt(input.amount);
      const bps = BigInt(input.bps);
      const result = ((amount * bps) / 10000n).toString();
      return ok("Applied bps", { amount: input.amount, bps: input.bps, result });
    } catch (e) {
      return fail(`apply_bps failed: ${errorMessage(e)}`);
    }
  },
};
