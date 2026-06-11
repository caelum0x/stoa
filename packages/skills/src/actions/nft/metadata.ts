import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc721Abi } from "../../abi/erc721.js";
import { addressSchema } from "../../schemas.js";

export const erc721MetadataSchema = z.object({
  token: addressSchema.describe("ERC-721 contract address."),
});

/// SKILL: erc721_metadata — collection name and symbol.
export const erc721MetadataAction: Action<typeof erc721MetadataSchema> = {
  name: "ERC721_METADATA",
  similes: ["nft collection name", "nft symbol", "erc721 metadata", "collection info"],
  description: "Return the name and symbol of an ERC-721 collection on Pharos.",
  examples: [
    {
      input: { token: "0xNFT" },
      output: ok("NFT metadata", { name: "Cool Cats", symbol: "COOL" }),
      explanation: "Reads name and symbol.",
    },
  ],
  schema: erc721MetadataSchema,
  handler: async (agent, input) => {
    try {
      const [name, symbol] = await Promise.all([
        agent.publicClient
          .readContract({ address: input.token, abi: erc721Abi, functionName: "name" })
          .catch(() => ""),
        agent.publicClient
          .readContract({ address: input.token, abi: erc721Abi, functionName: "symbol" })
          .catch(() => ""),
      ]);
      return ok("NFT metadata", { token: input.token, name, symbol });
    } catch (e) {
      return fail(`erc721_metadata failed: ${errorMessage(e)}`);
    }
  },
};
