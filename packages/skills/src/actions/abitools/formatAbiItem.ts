import { z } from "zod";
import { formatAbiItem } from "viem/utils";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const formatAbiItemSchema = z.object({
  item: z.string().describe("A JSON-stringified ABI item to format into a human-readable signature."),
});

/// SKILL: format_abi_item — format a JSON ABI item into a human-readable signature.
export const formatAbiItemAction: Action<typeof formatAbiItemSchema> = {
  name: "FORMAT_ABI_ITEM",
  similes: ["format abi item", "abi item to signature", "stringify abi", "human readable signature"],
  description: "Convert a JSON ABI item (as a JSON string) into its human-readable signature.",
  examples: [
    {
      input: { item: "{\"type\":\"function\",\"name\":\"transfer\",\"inputs\":[],\"outputs\":[]}" },
      output: ok("Formatted ABI item", { signature: "function transfer()" }),
      explanation: "Formats a JSON ABI item into a readable signature.",
    },
  ],
  schema: formatAbiItemSchema,
  handler: async (_agent, input) => {
    try {
      const signature = formatAbiItem(JSON.parse(input.item));
      return ok("Formatted ABI item", { signature });
    } catch (e) {
      return fail(`format_abi_item failed: ${errorMessage(e)}`);
    }
  },
};
