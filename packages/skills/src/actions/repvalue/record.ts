import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { valueReputationAbi } from "../../abi/valueReputation.js";
import { baseUnitsSchema } from "../../schemas.js";

export const repValueRecordSchema = z.object({
  agentId: z.coerce.number().int().positive().describe("Agent id (from StoaRegistry) being credited."),
  value: baseUnitsSchema.describe("Settled value in base units to record against the agent."),
});

/// SKILL: reputation_value_record — record settled economic value for an agent (value-weighted trust).
export const repValueRecordAction: Action<typeof repValueRecordSchema> = {
  name: "REPUTATION_VALUE_RECORD",
  similes: ["record settlement", "credit value", "log payment reputation", "value reputation"],
  description:
    "Record that you settled some value with an agent, accruing its value-weighted reputation. " +
    "Meant to be called by the paying counterparty after an escrow/tip/stream settles.",
  examples: [
    {
      input: { agentId: 7, value: "1000000000000000000" },
      output: ok("Settlement recorded", { txHash: "0x..." }),
      explanation: "Credits agent #7 with 1 PHRS of settled value.",
    },
  ],
  schema: repValueRecordSchema,
  handler: async (agent, input) => {
    try {
      const rep = agent.requireContract("valueReputation");
      const hash = await agent.walletClient.writeContract({
        address: rep,
        abi: valueReputationAbi,
        functionName: "recordSettlement",
        args: [BigInt(input.agentId), BigInt(input.value)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Settlement recorded", { agentId: input.agentId, value: input.value, txHash: hash });
    } catch (e) {
      return fail(`reputation_value_record failed: ${errorMessage(e)}`);
    }
  },
};
