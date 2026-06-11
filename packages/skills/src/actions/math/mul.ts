import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const mathMulSchema = z.object({
  a: baseUnitsSchema.describe("First integer factor, as a string."),
  b: baseUnitsSchema.describe("Second integer factor, as a string."),
});

/// SKILL: math_mul — multiply two arbitrary-precision integers.
export const mathMulAction: Action<typeof mathMulSchema> = {
  name: "MATH_MUL",
  similes: ["multiply", "times", "product", "multiplication"],
  description: "Multiply two integer strings using bigint arithmetic. No network access.",
  examples: [
    {
      input: { a: "4", b: "5" },
      output: ok("Product", { result: "20" }),
      explanation: "Computes 4 * 5.",
    },
  ],
  schema: mathMulSchema,
  handler: async (_agent, input) => {
    try {
      const result = (BigInt(input.a) * BigInt(input.b)).toString();
      return ok("Product", { a: input.a, b: input.b, result });
    } catch (e) {
      return fail(`math_mul failed: ${errorMessage(e)}`);
    }
  },
};
