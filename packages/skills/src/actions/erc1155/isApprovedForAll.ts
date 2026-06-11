import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc1155Abi } from "../../abi/erc1155.js";
import { addressSchema } from "../../schemas.js";

export const erc1155IsApprovedForAllSchema = z.object({
  token: addressSchema.describe("ERC-1155 contract address."),
  account: addressSchema.optional().describe("Owner address. Defaults to the agent."),
  operator: addressSchema.describe("Operator address to check."),
});

/// SKILL: erc1155_is_approved_for_all — operator approval status for all tokens.
export const erc1155IsApprovedForAllAction: Action<typeof erc1155IsApprovedForAllSchema> = {
  name: "ERC1155_IS_APPROVED_FOR_ALL",
  similes: ["erc1155 is approved", "operator approval 1155", "check 1155 approval", "isapprovedforall 1155"],
  description: "Return whether an operator is approved for all of an owner's ERC-1155 tokens on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", operator: "0xop" },
      output: ok("ERC-1155 approval", { approved: false }),
      explanation: "Checks operator approval for the agent.",
    },
  ],
  schema: erc1155IsApprovedForAllSchema,
  handler: async (agent, input) => {
    try {
      const account = input.account ?? agent.address;
      const approved = await agent.publicClient.readContract({
        address: input.token,
        abi: erc1155Abi,
        functionName: "isApprovedForAll",
        args: [account, input.operator],
      });
      return ok("ERC-1155 approval", {
        token: input.token,
        account,
        operator: input.operator,
        approved,
      });
    } catch (e) {
      return fail(`erc1155_is_approved_for_all failed: ${errorMessage(e)}`);
    }
  },
};
