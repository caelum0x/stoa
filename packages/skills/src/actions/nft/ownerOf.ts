import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc721Abi } from "../../abi/erc721.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

export const erc721OwnerOfSchema = z.object({
  token: addressSchema.describe("ERC-721 contract address."),
  tokenId: baseUnitsSchema.describe("Token id as an integer string."),
});

/// SKILL: erc721_owner_of — owner of a specific NFT.
export const erc721OwnerOfAction: Action<typeof erc721OwnerOfSchema> = {
  name: "ERC721_OWNER_OF",
  similes: ["nft owner", "who owns nft", "owner of token", "erc721 ownerof"],
  description: "Return the owner address of a specific ERC-721 token on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", tokenId: "1" },
      output: ok("NFT owner", { owner: "0xabc" }),
      explanation: "Reads ownerOf(1).",
    },
  ],
  schema: erc721OwnerOfSchema,
  handler: async (agent, input) => {
    try {
      const owner = await agent.publicClient.readContract({
        address: input.token,
        abi: erc721Abi,
        functionName: "ownerOf",
        args: [BigInt(input.tokenId)],
      });
      return ok("NFT owner", { token: input.token, tokenId: input.tokenId, owner });
    } catch (e) {
      return fail(`erc721_owner_of failed: ${errorMessage(e)}`);
    }
  },
};
