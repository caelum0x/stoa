import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { arbiterPanelAbi } from "../../abi/arbiterPanel.js";

export const disputeVoteSchema = z.object({
  caseId: z.coerce.number().int().nonnegative().describe("Dispute case id."),
  favorPayee: z.boolean().describe("true to vote for the worker (payee), false for the payer."),
});

/// SKILL: dispute_vote — cast an arbiter vote on a dispute case.
export const disputeVoteAction: Action<typeof disputeVoteSchema> = {
  name: "DISPUTE_VOTE",
  similes: ["vote dispute", "arbitrate", "rule on case", "cast verdict"],
  description: "Vote as an arbiter on a dispute case (favor payee or payer). Requires arbiter rights.",
  examples: [
    {
      input: { caseId: 0, favorPayee: true },
      output: ok("Vote cast", { txHash: "0x..." }),
      explanation: "Votes in favor of the worker.",
    },
  ],
  schema: disputeVoteSchema,
  handler: async (agent, input) => {
    try {
      const panel = agent.requireContract("arbiterPanel");
      const hash = await agent.walletClient.writeContract({
        address: panel,
        abi: arbiterPanelAbi,
        functionName: "vote",
        args: [BigInt(input.caseId), input.favorPayee],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Vote cast", { caseId: input.caseId, favorPayee: input.favorPayee, txHash: hash });
    } catch (e) {
      return fail(`dispute_vote failed: ${errorMessage(e)}`);
    }
  },
};
