import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc1155Abi } from "../../abi/erc1155.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

export const erc1155SafeTransferSchema = z.object({
  token: addressSchema.describe("ERC-1155 contract address."),
  to: addressSchema.describe("Recipient address."),
  id: baseUnitsSchema.describe("Token id (integer string)."),
  amount: baseUnitsSchema.describe("Amount of the token id to transfer (integer string)."),
});

/// SKILL: erc1155_safe_transfer — safeTransferFrom the agent to a recipient.
export const erc1155SafeTransferAction: Action<typeof erc1155SafeTransferSchema> = {
  name: "ERC1155_SAFE_TRANSFER",
  similes: ["erc1155 transfer", "send 1155", "safetransferfrom 1155", "transfer multitoken"],
  description: "Transfer an amount of an ERC-1155 token id from the agent to a recipient on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", to: "0xabc", id: "1", amount: "2" },
      output: ok("Transfer sent", { txHash: "0x..." }),
      explanation: "Sends 2 of token id 1.",
    },
  ],
  schema: erc1155SafeTransferSchema,
  handler: async (agent, input) => {
    try {
      const hash = await agent.walletClient.writeContract({
        address: input.token,
        abi: erc1155Abi,
        functionName: "safeTransferFrom",
        args: [agent.address, input.to, BigInt(input.id), BigInt(input.amount), "0x"],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Transfer sent", {
        token: input.token,
        from: agent.address,
        to: input.to,
        id: input.id,
        amount: input.amount,
        txHash: hash,
      });
    } catch (e) {
      return fail(`erc1155_safe_transfer failed: ${errorMessage(e)}`);
    }
  },
};
