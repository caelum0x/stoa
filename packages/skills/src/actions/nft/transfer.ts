import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc721Abi } from "../../abi/erc721.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

export const erc721TransferSchema = z.object({
  token: addressSchema.describe("ERC-721 contract address."),
  to: addressSchema.describe("Recipient address."),
  tokenId: baseUnitsSchema.describe("Token id as an integer string."),
});

/// SKILL: erc721_transfer — safely transfer an NFT from the agent to a recipient.
export const erc721TransferAction: Action<typeof erc721TransferSchema> = {
  name: "ERC721_TRANSFER",
  similes: ["send nft", "transfer nft", "safe transfer erc721", "move nft"],
  description: "Safely transfer an ERC-721 token from the agent to a recipient on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", to: "0xabc", tokenId: "1" },
      output: ok("NFT transfer sent", { txHash: "0x..." }),
      explanation: "safeTransferFrom(agent, to, 1).",
    },
  ],
  schema: erc721TransferSchema,
  handler: async (agent, input) => {
    try {
      const hash = await agent.walletClient.writeContract({
        address: input.token,
        abi: erc721Abi,
        functionName: "safeTransferFrom",
        args: [agent.address, input.to, BigInt(input.tokenId)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("NFT transfer sent", {
        token: input.token,
        to: input.to,
        tokenId: input.tokenId,
        txHash: hash,
      });
    } catch (e) {
      return fail(`erc721_transfer failed: ${errorMessage(e)}`);
    }
  },
};
