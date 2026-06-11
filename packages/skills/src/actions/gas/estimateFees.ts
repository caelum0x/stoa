import { z } from "zod";
import { formatGwei } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const estimateFeesSchema = z.object({});

/// SKILL: estimate_fees — EIP-1559 fee estimate (maxFeePerGas + priority).
export const estimateFeesAction: Action<typeof estimateFeesSchema> = {
  name: "ESTIMATE_FEES",
  similes: ["estimate fees", "eip1559 fees", "max fee per gas", "fee estimate"],
  description:
    "Estimate EIP-1559 gas fees on Pharos: maxFeePerGas and maxPriorityFeePerGas, in wei and gwei.",
  examples: [
    {
      input: {},
      output: ok("Fee estimate", { maxFeePerGasGwei: "1.5" }),
      explanation: "Estimates EIP-1559 fees per gas.",
    },
  ],
  schema: estimateFeesSchema,
  handler: async (agent) => {
    try {
      const fees = await agent.publicClient.estimateFeesPerGas();
      return ok("Fee estimate", {
        maxFeePerGas: fees.maxFeePerGas.toString(),
        maxFeePerGasGwei: formatGwei(fees.maxFeePerGas),
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas.toString(),
        maxPriorityFeePerGasGwei: formatGwei(fees.maxPriorityFeePerGas),
      });
    } catch (e) {
      return fail(`estimate_fees failed: ${errorMessage(e)}`);
    }
  },
};
