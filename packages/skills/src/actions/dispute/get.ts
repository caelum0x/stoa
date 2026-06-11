import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { arbiterPanelAbi, VERDICT } from "../../abi/arbiterPanel.js";

export const disputeGetSchema = z.object({
  caseId: z.coerce.number().int().nonnegative().describe("Dispute case id."),
});

/// SKILL: dispute_get — read a dispute case's tally and verdict.
export const disputeGetAction: Action<typeof disputeGetSchema> = {
  name: "DISPUTE_GET",
  similes: ["get dispute", "case status", "verdict", "dispute result"],
  description: "Read a dispute case: referenced job, evidence, vote tally, and current verdict.",
  examples: [
    {
      input: { caseId: 0 },
      output: ok("Dispute read", { verdict: "FavorPayee" }),
      explanation: "Reads a case's verdict.",
    },
  ],
  schema: disputeGetSchema,
  handler: async (agent, input) => {
    try {
      const panel = agent.requireContract("arbiterPanel");
      const [jobRef, opener, evidenceURI, votesPayee, votesPayer, verdict] =
        await agent.publicClient.readContract({
          address: panel,
          abi: arbiterPanelAbi,
          functionName: "getCase",
          args: [BigInt(input.caseId)],
        });
      return ok("Dispute read", {
        caseId: input.caseId,
        jobRef: Number(jobRef),
        opener,
        evidenceURI,
        votesPayee: Number(votesPayee),
        votesPayer: Number(votesPayer),
        verdict: VERDICT[Number(verdict)] ?? "Unknown",
      });
    } catch (e) {
      return fail(`dispute_get failed: ${errorMessage(e)}`);
    }
  },
};
