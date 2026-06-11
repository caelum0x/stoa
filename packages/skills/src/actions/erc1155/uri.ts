import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc1155Abi } from "../../abi/erc1155.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

export const erc1155UriSchema = z.object({
  token: addressSchema.describe("ERC-1155 contract address."),
  id: baseUnitsSchema.describe("Token id (integer string)."),
});

/// SKILL: erc1155_uri — metadata URI for a token id.
export const erc1155UriAction: Action<typeof erc1155UriSchema> = {
  name: "ERC1155_URI",
  similes: ["erc1155 uri", "token metadata uri", "1155 uri", "multitoken metadata"],
  description: "Return the metadata URI for an ERC-1155 token id on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", id: "1" },
      output: ok("ERC-1155 uri", { uri: "ipfs://.../{id}.json" }),
      explanation: "Reads the URI for token id 1.",
    },
  ],
  schema: erc1155UriSchema,
  handler: async (agent, input) => {
    try {
      const uri = await agent.publicClient.readContract({
        address: input.token,
        abi: erc1155Abi,
        functionName: "uri",
        args: [BigInt(input.id)],
      });
      return ok("ERC-1155 uri", { token: input.token, id: input.id, uri });
    } catch (e) {
      return fail(`erc1155_uri failed: ${errorMessage(e)}`);
    }
  },
};
