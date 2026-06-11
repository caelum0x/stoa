import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc1155Abi } from "../../abi/erc1155.js";
import { addressSchema } from "../../schemas.js";

export const erc1155SetApprovalForAllSchema = z.object({
  token: addressSchema.describe("ERC-1155 contract address."),
  operator: addressSchema.describe("Operator address to approve or revoke."),
  approved: z.boolean().describe("True to grant approval, false to revoke."),
});

/// SKILL: erc1155_set_approval_for_all — grant or revoke operator approval for all tokens.
export const erc1155SetApprovalForAllAction: Action<typeof erc1155SetApprovalForAllSchema> = {
  name: "ERC1155_SET_APPROVAL_FOR_ALL",
  similes: ["erc1155 set approval", "approve operator 1155", "setapprovalforall 1155", "revoke 1155 approval"],
  description: "Grant or revoke operator approval for all of the agent's ERC-1155 tokens on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", operator: "0xop", approved: true },
      output: ok("Approval set", { txHash: "0x..." }),
      explanation: "Approves an operator for all tokens.",
    },
  ],
  schema: erc1155SetApprovalForAllSchema,
  handler: async (agent, input) => {
    try {
      const hash = await agent.walletClient.writeContract({
        address: input.token,
        abi: erc1155Abi,
        functionName: "setApprovalForAll",
        args: [input.operator, input.approved],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Approval set", {
        token: input.token,
        operator: input.operator,
        approved: input.approved,
        txHash: hash,
      });
    } catch (e) {
      return fail(`erc1155_set_approval_for_all failed: ${errorMessage(e)}`);
    }
  },
};
