import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const mathMaxSchema = z.object({
  values: z.array(baseUnitsSchema).min(1).describe("Integer strings to compare."),
});

/// SKILL: math_max — largest of a list of arbitrary-precision integers.
export const mathMaxAction: Action<typeof mathMaxSchema> = {
  name: "MATH_MAX",
  similes: ["maximum", "largest", "highest", "max"],
  description: "Return the maximum of a list of integer strings using bigint arithmetic. No network access.",
  examples: [
    {
      input: { values: ["5", "2", "9"] },
      output: ok("Maximum", { result: "9" }),
      explanation: "Finds the largest value.",
    },
  ],
  schema: mathMaxSchema,
  handler: async (_agent, input) => {
    try {
      const nums = input.values.map((v) => BigInt(v));
      let result = nums[0] ?? 0n;
      for (const n of nums) if (n > result) result = n;
      return ok("Maximum", { values: input.values, result: result.toString() });
    } catch (e) {
      return fail(`math_max failed: ${errorMessage(e)}`);
    }
  },
};
