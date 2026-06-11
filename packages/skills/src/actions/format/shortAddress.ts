import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const formatShortAddressSchema = z.object({
  address: addressSchema.describe("Address to shorten."),
});

/// SKILL: format_short_address — shorten an address to first 6 + … + last 4.
export const formatShortAddressAction: Action<typeof formatShortAddressSchema> = {
  name: "FORMAT_SHORT_ADDRESS",
  similes: ["short address", "truncate address", "abbreviate address", "ellipsize address"],
  description: "Shorten a 0x address to its first 6 and last 4 characters joined by an ellipsis. Pure, no network access.",
  examples: [
    {
      input: { address: "0x1234567890abcdef1234567890abcdef12345678" },
      output: ok("Shortened address", { short: "0x1234…5678" }),
      explanation: "Abbreviates a full address for display.",
    },
  ],
  schema: formatShortAddressSchema,
  handler: async (_agent, input) => {
    try {
      const addr = input.address;
      const short = `${addr.slice(0, 6)}…${addr.slice(-4)}`;
      return ok("Shortened address", { address: addr, short });
    } catch (e) {
      return fail(`format_short_address failed: ${errorMessage(e)}`);
    }
  },
};
