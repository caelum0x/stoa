import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const mathCompareSchema = z.object({
  a: baseUnitsSchema.describe("Left integer operand, as a string."),
  b: baseUnitsSchema.describe("Right integer operand, as a string."),
});

/// SKILL: math_compare — compare two arbitrary-precision integers.
export const mathCompareAction: Action<typeof mathCompareSchema> = {
  name: "MATH_COMPARE",
  similes: ["compare", "cmp", "greater or less", "ordering"],
  description: "Compare a and b: returns -1 if a<b, 0 if equal, 1 if a>b. Uses bigint. No network access.",
  examples: [
    {
      input: { a: "3", b: "5" },
      output: ok("Comparison", { result: "-1" }),
      explanation: "3 is less than 5.",
    },
  ],
  schema: mathCompareSchema,
  handler: async (_agent, input) => {
    try {
      const a = BigInt(input.a);
      const b = BigInt(input.b);
      const result = a < b ? -1 : a > b ? 1 : 0;
      return ok("Comparison", { a: input.a, b: input.b, result: result.toString() });
    } catch (e) {
      return fail(`math_compare failed: ${errorMessage(e)}`);
    }
  },
};
