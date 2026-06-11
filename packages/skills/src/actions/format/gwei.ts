import { z } from "zod";
import { formatGwei } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const formatGweiSchema = z.object({
  wei: baseUnitsSchema.describe("Amount in wei (integer string)."),
});

/// SKILL: format_gwei — format a wei amount as a gwei decimal string.
export const formatGweiAction: Action<typeof formatGweiSchema> = {
  name: "FORMAT_GWEI",
  similes: ["format gwei", "wei to gwei", "humanize gas price", "gwei value"],
  description: "Format a wei amount into a gwei decimal string, useful for displaying gas prices. Pure, no network access.",
  examples: [
    {
      input: { wei: "1000000000" },
      output: ok("Formatted gwei", { gwei: "1" }),
      explanation: "Converts 1e9 wei to 1 gwei.",
    },
  ],
  schema: formatGweiSchema,
  handler: async (_agent, input) => {
    try {
      const gwei = formatGwei(BigInt(input.wei));
      return ok("Formatted gwei", { wei: input.wei, gwei });
    } catch (e) {
      return fail(`format_gwei failed: ${errorMessage(e)}`);
    }
  },
};
