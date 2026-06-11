import { z } from "zod";
import { parseAbiItem } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const parseAbiItemSchema = z.object({
  signature: z.string().describe("A single human-readable ABI signature, e.g. \"function transfer(address,uint256)\"."),
});

/// SKILL: parse_abi_item — parse a single human-readable ABI signature into a JSON ABI item.
export const parseAbiItemAction: Action<typeof parseAbiItemSchema> = {
  name: "PARSE_ABI_ITEM",
  similes: ["parse abi item", "signature to abi item", "single abi", "parse function signature"],
  description: "Convert one human-readable ABI signature into a structured JSON ABI item.",
  examples: [
    {
      input: { signature: "event Transfer(address indexed from, address indexed to, uint256 value)" },
      output: ok("Parsed ABI item", { item: {} }),
      explanation: "Parses a single event signature into its JSON ABI item.",
    },
  ],
  schema: parseAbiItemSchema,
  handler: async (_agent, input) => {
    try {
      const item = parseAbiItem(input.signature);
      return ok("Parsed ABI item", { item: JSON.parse(JSON.stringify(item)) });
    } catch (e) {
      return fail(`parse_abi_item failed: ${errorMessage(e)}`);
    }
  },
};
