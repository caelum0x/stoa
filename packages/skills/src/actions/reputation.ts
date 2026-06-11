import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../types.js";
import { stoaRegistryAbi } from "../abi/stoaRegistry.js";
import { agentIdSchema } from "../schemas.js";

export const reputationSchema = z.object({
  op: z.enum(["attest", "score"]).describe("attest = leave a review; score = read reputation."),
  agentId: agentIdSchema.describe("Target agent id in StoaRegistry."),
  score: z
    .number()
    .int()
    .min(-5)
    .max(5)
    .optional()
    .describe("Signed score [-5,5]. Required for attest."),
  uri: z.string().optional().describe("Optional evidence URI (receipt, tx hash, review)."),
});

/// SKILL: reputation
/// Writes a signed reputation attestation after a completed job, or reads an agent's score.
/// Each address may attest once per agent and cannot rate itself (enforced on-chain).
export const reputationAction: Action<typeof reputationSchema> = {
  name: "REPUTATION",
  similes: ["rate agent", "leave review", "attest", "reputation score", "trust score"],
  description:
    "Attest to an agent's reputation on Pharos (one attestation per address, no self-rating) " +
    "or read its accumulated score from the StoaRegistry.",
  examples: [
    {
      input: { op: "attest", agentId: 7, score: 5, uri: "ipfs://receipt" },
      output: ok("Attestation recorded", { txHash: "0x..." }),
      explanation: "Leaves a 5-star review backed by an on-chain receipt.",
    },
    {
      input: { op: "score", agentId: 7 },
      output: ok("Reputation read", { count: 12, scoreSum: 51, averageX100: 425 }),
      explanation: "Reads an agent's reputation (avg 4.25).",
    },
  ],
  schema: reputationSchema,
  handler: async (agent, input) => {
    try {
      const registry = agent.requireContract("registry");

      if (input.op === "attest") {
        if (input.score === undefined) return fail("score is required to attest.");
        const hash = await agent.walletClient.writeContract({
          address: registry,
          abi: stoaRegistryAbi,
          functionName: "attest",
          args: [BigInt(input.agentId), input.score, input.uri ?? ""],
        });
        await agent.publicClient.waitForTransactionReceipt({ hash });
        return ok("Attestation recorded", { agentId: input.agentId, score: input.score, txHash: hash });
      }

      // score
      const [count, scoreSum] = await agent.publicClient.readContract({
        address: registry,
        abi: stoaRegistryAbi,
        functionName: "reputationOf",
        args: [BigInt(input.agentId)],
      });
      const averageX100 = await agent.publicClient.readContract({
        address: registry,
        abi: stoaRegistryAbi,
        functionName: "averageScoreX100",
        args: [BigInt(input.agentId)],
      });
      return ok("Reputation read", {
        agentId: input.agentId,
        count: Number(count),
        scoreSum: Number(scoreSum),
        averageX100: Number(averageX100),
      });
    } catch (e) {
      return fail(`reputation failed: ${errorMessage(e)}`);
    }
  },
};
