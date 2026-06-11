import { z } from "zod";
import { getAbiItem } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const getAbiItemSchema = z.object({
  abi: z.string().describe("A JSON-stringified ABI array to search."),
  name: z.string().describe("The name of the ABI item (function/event/error) to retrieve."),
});

/// SKILL: get_abi_item — find a named item within a JSON ABI.
export const getAbiItemAction: Action<typeof getAbiItemSchema> = {
  name: "GET_ABI_ITEM",
  similes: ["get abi item", "find abi item", "lookup abi", "abi item by name"],
  description: "Retrieve a named function, event, or error item from a JSON ABI array.",
  examples: [
    {
      input: { abi: "[{\"type\":\"function\",\"name\":\"transfer\",\"inputs\":[],\"outputs\":[]}]", name: "transfer" },
      output: ok("ABI item", { item: {} }),
      explanation: "Looks up the 'transfer' item in the supplied ABI.",
    },
  ],
  schema: getAbiItemSchema,
  handler: async (_agent, input) => {
    try {
      const item = getAbiItem({ abi: JSON.parse(input.abi), name: input.name });
      return ok("ABI item", { item: JSON.parse(JSON.stringify(item ?? null)) });
    } catch (e) {
      return fail(`get_abi_item failed: ${errorMessage(e)}`);
    }
  },
};
