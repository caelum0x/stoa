import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const mathSubSchema = z.object({
  a: baseUnitsSchema.describe("Minuend, as an integer string."),
  b: baseUnitsSchema.describe("Subtrahend, as an integer string."),
});

/// SKILL: math_sub — subtract two arbitrary-precision integers.
export const mathSubAction: Action<typeof mathSubSchema> = {
  name: "MATH_SUB",
  similes: ["subtract", "minus", "difference", "subtraction"],
  description: "Subtract b from a using bigint arithmetic. No network access.",
  examples: [
    {
      input: { a: "5", b: "3" },
      output: ok("Difference", { result: "2" }),
      explanation: "Computes 5 - 3.",
    },
  ],
  schema: mathSubSchema,
  handler: async (_agent, input) => {
    try {
      const result = (BigInt(input.a) - BigInt(input.b)).toString();
      return ok("Difference", { a: input.a, b: input.b, result });
    } catch (e) {
      return fail(`math_sub failed: ${errorMessage(e)}`);
    }
  },
};
