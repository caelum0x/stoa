import { z } from "zod";
import { formatGwei } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const maxPriorityFeeSchema = z.object({});

/// SKILL: max_priority_fee — current max priority fee per gas (tip).
export const maxPriorityFeeAction: Action<typeof maxPriorityFeeSchema> = {
  name: "MAX_PRIORITY_FEE",
  similes: ["priority fee", "max priority fee", "miner tip", "gas tip"],
  description:
    "Estimate the current max priority fee per gas (tip) on Pharos, in wei and gwei.",
  examples: [
    {
      input: {},
      output: ok("Max priority fee", { gwei: "0.1" }),
      explanation: "Estimates the priority fee (tip) per gas.",
    },
  ],
  schema: maxPriorityFeeSchema,
  handler: async (agent) => {
    try {
      const wei = await agent.publicClient.estimateMaxPriorityFeePerGas();
      return ok("Max priority fee", { wei: wei.toString(), gwei: formatGwei(wei) });
    } catch (e) {
      return fail(`max_priority_fee failed: ${errorMessage(e)}`);
    }
  },
};
