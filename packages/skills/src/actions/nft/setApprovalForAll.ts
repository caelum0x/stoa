import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc721Abi } from "../../abi/erc721.js";
import { addressSchema } from "../../schemas.js";

export const erc721SetApprovalForAllSchema = z.object({
  token: addressSchema.describe("ERC-721 contract address."),
  operator: addressSchema.describe("Operator address to grant or revoke."),
  approved: z.boolean().describe("True to grant, false to revoke."),
});

/// SKILL: erc721_set_approval_for_all — grant/revoke an operator for the whole collection.
export const erc721SetApprovalForAllAction: Action<typeof erc721SetApprovalForAllSchema> = {
  name: "ERC721_SET_APPROVAL_FOR_ALL",
  similes: ["approve all nfts", "set approval for all", "operator approval", "grant collection approval"],
  description: "Grant or revoke an operator's approval over all of the agent's ERC-721 tokens in a collection on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", operator: "0xabc", approved: true },
      output: ok("Approval-for-all sent", { txHash: "0x..." }),
      explanation: "setApprovalForAll(operator, true).",
    },
  ],
  schema: erc721SetApprovalForAllSchema,
  handler: async (agent, input) => {
    try {
      const hash = await agent.walletClient.writeContract({
        address: input.token,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [input.operator, input.approved],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Approval-for-all sent", {
        token: input.token,
        operator: input.operator,
        approved: input.approved,
        txHash: hash,
      });
    } catch (e) {
      return fail(`erc721_set_approval_for_all failed: ${errorMessage(e)}`);
    }
  },
};
