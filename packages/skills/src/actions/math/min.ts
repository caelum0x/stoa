import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const mathMinSchema = z.object({
  values: z.array(baseUnitsSchema).min(1).describe("Integer strings to compare."),
});

/// SKILL: math_min — smallest of a list of arbitrary-precision integers.
export const mathMinAction: Action<typeof mathMinSchema> = {
  name: "MATH_MIN",
  similes: ["minimum", "smallest", "lowest", "min"],
  description: "Return the minimum of a list of integer strings using bigint arithmetic. No network access.",
  examples: [
    {
      input: { values: ["5", "2", "9"] },
      output: ok("Minimum", { result: "2" }),
      explanation: "Finds the smallest value.",
    },
  ],
  schema: mathMinSchema,
  handler: async (_agent, input) => {
    try {
      const nums = input.values.map((v) => BigInt(v));
      let result = nums[0] ?? 0n;
      for (const n of nums) if (n < result) result = n;
      return ok("Minimum", { values: input.values, result: result.toString() });
    } catch (e) {
      return fail(`math_min failed: ${errorMessage(e)}`);
    }
  },
};
