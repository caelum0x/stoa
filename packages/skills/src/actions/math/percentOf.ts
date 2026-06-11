import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const mathPercentOfSchema = z.object({
  value: baseUnitsSchema.describe("Base integer value, as a string."),
  percent: baseUnitsSchema.describe("Percentage as an integer string (e.g. \"25\")."),
});

/// SKILL: math_percent_of — integer percentage of a value.
export const mathPercentOfAction: Action<typeof mathPercentOfSchema> = {
  name: "MATH_PERCENT_OF",
  similes: ["percent of", "percentage", "take percent", "x percent"],
  description: "Compute (value * percent / 100) using bigint integer arithmetic. No network access.",
  examples: [
    {
      input: { value: "200", percent: "25" },
      output: ok("Percentage", { result: "50" }),
      explanation: "25% of 200 is 50.",
    },
  ],
  schema: mathPercentOfSchema,
  handler: async (_agent, input) => {
    try {
      const result = ((BigInt(input.value) * BigInt(input.percent)) / 100n).toString();
      return ok("Percentage", { value: input.value, percent: input.percent, result });
    } catch (e) {
      return fail(`math_percent_of failed: ${errorMessage(e)}`);
    }
  },
};
