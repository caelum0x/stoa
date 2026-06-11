import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc721Abi } from "../../abi/erc721.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

export const erc721TokenUriSchema = z.object({
  token: addressSchema.describe("ERC-721 contract address."),
  tokenId: baseUnitsSchema.describe("Token id as an integer string."),
});

/// SKILL: erc721_token_uri — metadata URI for a specific NFT.
export const erc721TokenUriAction: Action<typeof erc721TokenUriSchema> = {
  name: "ERC721_TOKEN_URI",
  similes: ["nft uri", "token uri", "nft metadata url", "erc721 tokenuri"],
  description: "Return the tokenURI (metadata location) of a specific ERC-721 token on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", tokenId: "1" },
      output: ok("Token URI", { uri: "ipfs://..." }),
      explanation: "Reads tokenURI(1).",
    },
  ],
  schema: erc721TokenUriSchema,
  handler: async (agent, input) => {
    try {
      const uri = await agent.publicClient.readContract({
        address: input.token,
        abi: erc721Abi,
        functionName: "tokenURI",
        args: [BigInt(input.tokenId)],
      });
      return ok("Token URI", { token: input.token, tokenId: input.tokenId, uri });
    } catch (e) {
      return fail(`erc721_token_uri failed: ${errorMessage(e)}`);
    }
  },
};
