import { z } from "zod";
import { parseGwei } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { decimalAmountSchema } from "../../schemas.js";

export const gweiToWeiSchema = z.object({
  gwei: decimalAmountSchema.describe("Gwei amount as a decimal string, e.g. \"20\"."),
});

/// SKILL: gwei_to_wei — convert a decimal gwei amount to wei base units.
export const gweiToWeiAction: Action<typeof gweiToWeiSchema> = {
  name: "GWEI_TO_WEI",
  similes: ["gwei to wei", "parse gwei", "convert gwei to wei", "gas price to wei"],
  description: "Convert a decimal gwei amount (9 decimals) into its wei base-unit integer string.",
  examples: [
    {
      input: { gwei: "20" },
      output: ok("Converted gwei to wei", { wei: "20000000000" }),
      explanation: "Parses 20 gwei into wei.",
    },
  ],
  schema: gweiToWeiSchema,
  handler: async (_agent, input) => {
    try {
      const wei = parseGwei(input.gwei);
      return ok("Converted gwei to wei", { gwei: input.gwei, wei: wei.toString() });
    } catch (e) {
      return fail(`gwei_to_wei failed: ${errorMessage(e)}`);
    }
  },
};
