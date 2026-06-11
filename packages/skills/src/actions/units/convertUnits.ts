import { z } from "zod";
import { formatUnits, parseUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

const decimalsSchema = z.coerce.number().int().min(0).max(255);

export const convertUnitsSchema = z.object({
  value: baseUnitsSchema.describe("Value in base units as an integer string."),
  fromDecimals: decimalsSchema.describe("Decimals the input value is denominated in."),
  toDecimals: decimalsSchema.describe("Decimals to re-denominate the value into."),
});

/// SKILL: convert_units — re-denominate a base-unit value between two decimal scales.
export const convertUnitsAction: Action<typeof convertUnitsSchema> = {
  name: "CONVERT_UNITS",
  similes: ["convert units", "change decimals", "redenominate", "rescale base units"],
  description: "Re-denominate an integer base-unit value from one decimals scale to another, returning base units in the target decimals.",
  examples: [
    {
      input: { value: "1000000", fromDecimals: 6, toDecimals: 18 },
      output: ok("Converted units", { value: "1000000000000000000" }),
      explanation: "Converts 1.0 (6 decimals) into its 18-decimal base units.",
    },
  ],
  schema: convertUnitsSchema,
  handler: async (_agent, input) => {
    try {
      const human = formatUnits(BigInt(input.value), input.fromDecimals);
      const result = parseUnits(human, input.toDecimals);
      return ok("Converted units", {
        value: result.toString(),
        human,
        fromDecimals: input.fromDecimals,
        toDecimals: input.toDecimals,
      });
    } catch (e) {
      return fail(`convert_units failed: ${errorMessage(e)}`);
    }
  },
};
