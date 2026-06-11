import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const mathDivSchema = z.object({
  a: baseUnitsSchema.describe("Dividend, as an integer string."),
  b: baseUnitsSchema.describe("Divisor, as an integer string (non-zero)."),
});

/// SKILL: math_div — integer-divide two arbitrary-precision integers.
export const mathDivAction: Action<typeof mathDivSchema> = {
  name: "MATH_DIV",
  similes: ["divide", "division", "quotient", "integer divide"],
  description: "Integer-divide a by b using bigint arithmetic. Fails on divide-by-zero. No network access.",
  examples: [
    {
      input: { a: "7", b: "2" },
      output: ok("Quotient", { result: "3" }),
      explanation: "Computes floor(7 / 2) toward zero.",
    },
  ],
  schema: mathDivSchema,
  handler: async (_agent, input) => {
    try {
      const divisor = BigInt(input.b);
      if (divisor === 0n) return fail("math_div failed: division by zero.");
      const result = (BigInt(input.a) / divisor).toString();
      return ok("Quotient", { a: input.a, b: input.b, result });
    } catch (e) {
      return fail(`math_div failed: ${errorMessage(e)}`);
    }
  },
};
