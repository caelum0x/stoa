import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { valueReputationAbi } from "../../abi/valueReputation.js";

export const repValueScoreSchema = z.object({
  agentId: z.coerce.number().int().positive().describe("Agent id to read value reputation for."),
});

/// SKILL: reputation_value_score — read an agent's value-weighted reputation.
export const repValueScoreAction: Action<typeof repValueScoreSchema> = {
  name: "REPUTATION_VALUE_SCORE",
  similes: ["value reputation score", "total settled", "economic trust", "how much settled"],
  description: "Read an agent's value-weighted reputation: total value settled, job count, and average.",
  examples: [
    {
      input: { agentId: 7 },
      output: ok("Value reputation", { totalValue: "5000000000000000000", jobCount: 5 }),
      explanation: "Reads agent #7's economic reputation.",
    },
  ],
  schema: repValueScoreSchema,
  handler: async (agent, input) => {
    try {
      const rep = agent.requireContract("valueReputation");
      const [totalValue, jobCount, averageValue] = await agent.publicClient.readContract({
        address: rep,
        abi: valueReputationAbi,
        functionName: "scoreOf",
        args: [BigInt(input.agentId)],
      });
      return ok("Value reputation", {
        agentId: input.agentId,
        totalValue: totalValue.toString(),
        jobCount: Number(jobCount),
        averageValue: averageValue.toString(),
      });
    } catch (e) {
      return fail(`reputation_value_score failed: ${errorMessage(e)}`);
    }
  },
};
