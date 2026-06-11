import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const mathAddSchema = z.object({
  a: baseUnitsSchema.describe("First integer operand, as a string."),
  b: baseUnitsSchema.describe("Second integer operand, as a string."),
});

/// SKILL: math_add — add two arbitrary-precision integers.
export const mathAddAction: Action<typeof mathAddSchema> = {
  name: "MATH_ADD",
  similes: ["add", "sum", "plus", "addition"],
  description: "Add two integer strings using bigint arithmetic. No network access.",
  examples: [
    {
      input: { a: "2", b: "3" },
      output: ok("Sum", { result: "5" }),
      explanation: "Adds 2 and 3.",
    },
  ],
  schema: mathAddSchema,
  handler: async (_agent, input) => {
    try {
      const result = (BigInt(input.a) + BigInt(input.b)).toString();
      return ok("Sum", { a: input.a, b: input.b, result });
    } catch (e) {
      return fail(`math_add failed: ${errorMessage(e)}`);
    }
  },
};
