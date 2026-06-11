import { z } from "zod";
import { formatGwei } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const weiToGweiSchema = z.object({
  wei: baseUnitsSchema.describe("Wei amount as an integer string."),
});

/// SKILL: wei_to_gwei — convert a wei base-unit integer string to decimal gwei.
export const weiToGweiAction: Action<typeof weiToGweiSchema> = {
  name: "WEI_TO_GWEI",
  similes: ["wei to gwei", "format gwei", "convert wei to gwei", "wei to gas price"],
  description: "Convert a wei base-unit integer string into its decimal gwei representation (9 decimals).",
  examples: [
    {
      input: { wei: "20000000000" },
      output: ok("Converted wei to gwei", { gwei: "20" }),
      explanation: "Formats 20000000000 wei into gwei.",
    },
  ],
  schema: weiToGweiSchema,
  handler: async (_agent, input) => {
    try {
      const gwei = formatGwei(BigInt(input.wei));
      return ok("Converted wei to gwei", { wei: input.wei, gwei });
    } catch (e) {
      return fail(`wei_to_gwei failed: ${errorMessage(e)}`);
    }
  },
};
