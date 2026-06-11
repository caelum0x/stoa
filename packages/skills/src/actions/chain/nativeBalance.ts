import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const nativeBalanceSchema = z.object({
  address: addressSchema.optional().describe("Address to query. Defaults to the agent's own address."),
});

/// SKILL: get_native_balance — PHRS balance of an address.
export const nativeBalanceAction: Action<typeof nativeBalanceSchema> = {
  name: "GET_NATIVE_BALANCE",
  similes: ["phrs balance", "native balance", "wallet balance", "eth balance"],
  description: "Return the native PHRS balance of an address (defaults to the agent's own address).",
  examples: [
    { input: {}, output: ok("Balance", { phrs: "1.5" }), explanation: "Reads the agent's PHRS balance." },
  ],
  schema: nativeBalanceSchema,
  handler: async (agent, input) => {
    try {
      const address = input.address ?? agent.address;
      const wei = await agent.publicClient.getBalance({ address });
      return ok("Balance", { address, wei: wei.toString(), phrs: formatEther(wei) });
    } catch (e) {
      return fail(`get_native_balance failed: ${errorMessage(e)}`);
    }
  },
};
