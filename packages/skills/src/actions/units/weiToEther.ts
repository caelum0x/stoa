import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const weiToEtherSchema = z.object({
  wei: baseUnitsSchema.describe("Wei amount as an integer string."),
});

/// SKILL: wei_to_ether — convert a wei base-unit integer string to decimal ether.
export const weiToEtherAction: Action<typeof weiToEtherSchema> = {
  name: "WEI_TO_ETHER",
  similes: ["wei to ether", "wei to eth", "format ether", "convert wei to ether"],
  description: "Convert a wei base-unit integer string into its decimal ether representation (18 decimals).",
  examples: [
    {
      input: { wei: "1500000000000000000" },
      output: ok("Converted wei to ether", { ether: "1.5" }),
      explanation: "Formats 1.5e18 wei into ether.",
    },
  ],
  schema: weiToEtherSchema,
  handler: async (_agent, input) => {
    try {
      const ether = formatEther(BigInt(input.wei));
      return ok("Converted wei to ether", { wei: input.wei, ether });
    } catch (e) {
      return fail(`wei_to_ether failed: ${errorMessage(e)}`);
    }
  },
};
