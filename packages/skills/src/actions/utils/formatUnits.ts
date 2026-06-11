import { z } from "zod";
import { formatUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const formatUnitsSchema = z.object({
  value: baseUnitsSchema.describe("Base-unit integer string to format."),
  decimals: z.coerce.number().int().min(0).max(255).describe("Number of token decimals."),
});

/// SKILL: format_units — convert base units into a human-readable decimal string.
export const formatUnitsAction: Action<typeof formatUnitsSchema> = {
  name: "FORMAT_UNITS",
  similes: ["format units", "from base units", "from wei", "units to decimal"],
  description: "Convert a base-unit integer string into a human-readable decimal amount given a decimals count.",
  examples: [
    {
      input: { value: "1500000000000000000", decimals: 18 },
      output: ok("Formatted", { amount: "1.5" }),
      explanation: "Formats 1.5e18 base units with 18 decimals.",
    },
  ],
  schema: formatUnitsSchema,
  handler: async (_agent, input) => {
    try {
      const amount = formatUnits(BigInt(input.value), input.decimals);
      return ok("Formatted", { amount });
    } catch (e) {
      return fail(`format_units failed: ${errorMessage(e)}`);
    }
  },
};
