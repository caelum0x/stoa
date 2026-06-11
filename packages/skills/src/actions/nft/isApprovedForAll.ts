import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc721Abi } from "../../abi/erc721.js";
import { addressSchema } from "../../schemas.js";

export const erc721IsApprovedForAllSchema = z.object({
  token: addressSchema.describe("ERC-721 contract address."),
  owner: addressSchema.optional().describe("Owner address. Defaults to the agent."),
  operator: addressSchema.describe("Operator address to check."),
});

/// SKILL: erc721_is_approved_for_all — check operator approval over a whole collection.
export const erc721IsApprovedForAllAction: Action<typeof erc721IsApprovedForAllSchema> = {
  name: "ERC721_IS_APPROVED_FOR_ALL",
  similes: ["is approved for all", "check operator approval", "nft operator allowed", "collection approval status"],
  description: "Check whether an operator is approved for all of an owner's ERC-721 tokens in a collection on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", operator: "0xabc" },
      output: ok("Approval-for-all status", { approved: true }),
      explanation: "isApprovedForAll(agent, operator).",
    },
  ],
  schema: erc721IsApprovedForAllSchema,
  handler: async (agent, input) => {
    try {
      const owner = input.owner ?? agent.address;
      const approved = await agent.publicClient.readContract({
        address: input.token,
        abi: erc721Abi,
        functionName: "isApprovedForAll",
        args: [owner, input.operator],
      });
      return ok("Approval-for-all status", {
        token: input.token,
        owner,
        operator: input.operator,
        approved,
      });
    } catch (e) {
      return fail(`erc721_is_approved_for_all failed: ${errorMessage(e)}`);
    }
  },
};
