import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { decimalAmountSchema } from "../../schemas.js";

export const etherToWeiSchema = z.object({
  amount: decimalAmountSchema.describe("Ether amount as a decimal string, e.g. \"1.5\"."),
});

/// SKILL: ether_to_wei — convert a decimal ether amount to wei base units.
export const etherToWeiAction: Action<typeof etherToWeiSchema> = {
  name: "ETHER_TO_WEI",
  similes: ["ether to wei", "eth to wei", "parse ether", "convert ether to wei"],
  description: "Convert a decimal ether amount (18 decimals) into its wei base-unit integer string.",
  examples: [
    {
      input: { amount: "1.5" },
      output: ok("Converted ether to wei", { wei: "1500000000000000000" }),
      explanation: "Parses 1.5 ether into wei.",
    },
  ],
  schema: etherToWeiSchema,
  handler: async (_agent, input) => {
    try {
      const wei = parseEther(input.amount);
      return ok("Converted ether to wei", { ether: input.amount, wei: wei.toString() });
    } catch (e) {
      return fail(`ether_to_wei failed: ${errorMessage(e)}`);
    }
  },
};
