import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc721Abi } from "../../abi/erc721.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

export const erc721GetApprovedSchema = z.object({
  token: addressSchema.describe("ERC-721 contract address."),
  tokenId: baseUnitsSchema.describe("Token id as an integer string."),
});

/// SKILL: erc721_get_approved — approved address for a single NFT.
export const erc721GetApprovedAction: Action<typeof erc721GetApprovedSchema> = {
  name: "ERC721_GET_APPROVED",
  similes: ["get approved nft", "nft approved address", "erc721 getapproved", "who can transfer nft"],
  description: "Return the address approved to transfer a specific ERC-721 token on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", tokenId: "1" },
      output: ok("Approved address", { approved: "0xabc" }),
      explanation: "getApproved(1).",
    },
  ],
  schema: erc721GetApprovedSchema,
  handler: async (agent, input) => {
    try {
      const approved = await agent.publicClient.readContract({
        address: input.token,
        abi: erc721Abi,
        functionName: "getApproved",
        args: [BigInt(input.tokenId)],
      });
      return ok("Approved address", { token: input.token, tokenId: input.tokenId, approved });
    } catch (e) {
      return fail(`erc721_get_approved failed: ${errorMessage(e)}`);
    }
  },
};
