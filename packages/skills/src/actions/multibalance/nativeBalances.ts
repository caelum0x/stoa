import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const nativeBalancesSchema = z.object({
  addresses: z
    .array(addressSchema)
    .min(1)
    .max(50)
    .describe("Addresses to read native PHRS balances for (max 50)."),
});

/// SKILL: native_balances — batched native PHRS balances for many addresses.
export const nativeBalancesAction: Action<typeof nativeBalancesSchema> = {
  name: "NATIVE_BALANCES",
  similes: ["native balances", "phrs balances", "bulk native balance", "multi balance"],
  description: "Return the native PHRS balance for each of several addresses on Pharos, formatted in PHRS.",
  examples: [
    {
      input: { addresses: ["0x1111111111111111111111111111111111111111"] },
      output: ok("Native balances", {
        balances: [{ address: "0x1111111111111111111111111111111111111111", phrs: "1.0" }],
      }),
      explanation: "Reads native PHRS balances for the given addresses.",
    },
  ],
  schema: nativeBalancesSchema,
  handler: async (agent, input) => {
    try {
      const balances = await Promise.all(
        input.addresses.map(async (address) => {
          const wei = await agent.publicClient.getBalance({ address });
          return { address, phrs: formatEther(wei) };
        }),
      );
      return ok("Native balances", { count: balances.length, balances });
    } catch (e) {
      return fail(`native_balances failed: ${errorMessage(e)}`);
    }
  },
};
