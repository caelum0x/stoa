import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const estimateGasSchema = z.object({
  to: addressSchema.describe("Destination address."),
  value: z.string().optional().describe("PHRS value to send, human units."),
  data: z.string().optional().describe("Optional calldata (0x...)."),
});

/// SKILL: estimate_gas — estimate gas for a native/contract call.
export const estimateGasAction: Action<typeof estimateGasSchema> = {
  name: "ESTIMATE_GAS",
  similes: ["gas estimate", "how much gas", "estimate fee"],
  description: "Estimate the gas required for a transaction from the agent on Pharos.",
  examples: [
    {
      input: { to: "0xabc...", value: "0.1" },
      output: ok("Gas estimate", { gas: "21000" }),
      explanation: "Estimates gas for a simple transfer.",
    },
  ],
  schema: estimateGasSchema,
  handler: async (agent, input) => {
    try {
      const gas = await agent.publicClient.estimateGas({
        account: agent.account,
        to: input.to,
        value: input.value ? parseEther(input.value) : undefined,
        data: input.data as `0x${string}` | undefined,
      });
      return ok("Gas estimate", { gas: gas.toString() });
    } catch (e) {
      return fail(`estimate_gas failed: ${errorMessage(e)}`);
    }
  },
};
