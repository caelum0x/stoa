import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc721Abi } from "../../abi/erc721.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

export const erc721ApproveSchema = z.object({
  token: addressSchema.describe("ERC-721 contract address."),
  to: addressSchema.describe("Address to approve for the token."),
  tokenId: baseUnitsSchema.describe("Token id as an integer string."),
});

/// SKILL: erc721_approve — grant approval for a single NFT.
export const erc721ApproveAction: Action<typeof erc721ApproveSchema> = {
  name: "ERC721_APPROVE",
  similes: ["approve nft", "erc721 approve", "grant nft approval", "allow spender nft"],
  description: "Approve an address to transfer a specific ERC-721 token owned by the agent on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", to: "0xabc", tokenId: "1" },
      output: ok("NFT approval sent", { txHash: "0x..." }),
      explanation: "approve(to, 1).",
    },
  ],
  schema: erc721ApproveSchema,
  handler: async (agent, input) => {
    try {
      const hash = await agent.walletClient.writeContract({
        address: input.token,
        abi: erc721Abi,
        functionName: "approve",
        args: [input.to, BigInt(input.tokenId)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("NFT approval sent", {
        token: input.token,
        to: input.to,
        tokenId: input.tokenId,
        txHash: hash,
      });
    } catch (e) {
      return fail(`erc721_approve failed: ${errorMessage(e)}`);
    }
  },
};
