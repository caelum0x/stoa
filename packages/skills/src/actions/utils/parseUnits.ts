import { z } from "zod";
import { parseUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { decimalAmountSchema } from "../../schemas.js";

export const parseUnitsSchema = z.object({
  amount: decimalAmountSchema.describe("Human-readable decimal amount, e.g. \"1.5\"."),
  decimals: z.coerce.number().int().min(0).max(255).describe("Number of token decimals."),
});

/// SKILL: parse_units — convert a decimal amount to base units (string).
export const parseUnitsAction: Action<typeof parseUnitsSchema> = {
  name: "PARSE_UNITS",
  similes: ["parse units", "to base units", "to wei", "decimal to units"],
  description: "Convert a human-readable decimal amount into base units given a decimals count.",
  examples: [
    {
      input: { amount: "1.5", decimals: 18 },
      output: ok("Parsed", { value: "1500000000000000000" }),
      explanation: "Converts 1.5 tokens with 18 decimals.",
    },
  ],
  schema: parseUnitsSchema,
  handler: async (_agent, input) => {
    try {
      const value = parseUnits(input.amount, input.decimals);
      return ok("Parsed", { value: value.toString() });
    } catch (e) {
      return fail(`parse_units failed: ${errorMessage(e)}`);
    }
  },
};
