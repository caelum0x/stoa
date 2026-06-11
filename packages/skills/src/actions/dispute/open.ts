import { z } from "zod";
import { parseEventLogs } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { arbiterPanelAbi } from "../../abi/arbiterPanel.js";

export const disputeOpenSchema = z.object({
  jobRef: z.coerce.number().int().nonnegative().describe("Referenced StoaEscrow jobId."),
  evidenceURI: z.string().optional().describe("URI to off-chain evidence (receipts, logs, chat)."),
});

/// SKILL: dispute_open — open a dispute case before the arbiter panel for an escrow job.
export const disputeOpenAction: Action<typeof disputeOpenSchema> = {
  name: "DISPUTE_OPEN",
  similes: ["open dispute", "raise dispute", "contest job", "file case"],
  description: "Open a dispute case in the ArbiterPanel referencing a StoaEscrow job, with evidence.",
  examples: [
    {
      input: { jobRef: 3, evidenceURI: "ipfs://evidence" },
      output: ok("Dispute opened", { caseId: 0, txHash: "0x..." }),
      explanation: "Files a dispute over escrow job #3.",
    },
  ],
  schema: disputeOpenSchema,
  handler: async (agent, input) => {
    try {
      const panel = agent.requireContract("arbiterPanel");
      const hash = await agent.walletClient.writeContract({
        address: panel,
        abi: arbiterPanelAbi,
        functionName: "openCase",
        args: [BigInt(input.jobRef), input.evidenceURI ?? ""],
      });
      const receipt = await agent.publicClient.waitForTransactionReceipt({ hash });
      const events = parseEventLogs({ abi: arbiterPanelAbi, logs: receipt.logs, eventName: "CaseOpened" });
      const caseId = events[0]?.args.caseId;
      return ok("Dispute opened", {
        caseId: caseId !== undefined ? Number(caseId) : undefined,
        jobRef: input.jobRef,
        txHash: hash,
      });
    } catch (e) {
      return fail(`dispute_open failed: ${errorMessage(e)}`);
    }
  },
};
