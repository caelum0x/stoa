import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { faucetAbi } from "../../abi/faucet.js";
import { addressSchema } from "../../schemas.js";

export const faucetStatusSchema = z.object({
  address: addressSchema.optional().describe("Account to inspect. Defaults to the agent."),
});

/// SKILL: faucet_status — drip amount, cooldown, and next eligible drip time.
export const faucetStatusAction: Action<typeof faucetStatusSchema> = {
  name: "FAUCET_STATUS",
  similes: ["faucet status", "when can i drip", "faucet cooldown", "next faucet drip"],
  description: "Report the faucet's drip amount, cooldown, and the next drip time for an account.",
  examples: [
    {
      input: {},
      output: ok("Faucet status", { dripAmount: "0.1", cooldown: 86400, nextDripAt: 0 }),
      explanation: "Reads faucet config for the agent.",
    },
  ],
  schema: faucetStatusSchema,
  handler: async (agent, input) => {
    try {
      const faucet = agent.requireContract("faucet");
      const account = input.address ?? agent.address;
      const [dripAmount, cooldown, nextDripAt] = await Promise.all([
        agent.publicClient.readContract({ address: faucet, abi: faucetAbi, functionName: "dripAmount" }),
        agent.publicClient.readContract({ address: faucet, abi: faucetAbi, functionName: "cooldown" }),
        agent.publicClient.readContract({ address: faucet, abi: faucetAbi, functionName: "nextDripAt", args: [account] }),
      ]);
      return ok("Faucet status", {
        faucet,
        account,
        dripAmount: formatEther(dripAmount),
        cooldown: Number(cooldown),
        nextDripAt: Number(nextDripAt),
      });
    } catch (e) {
      return fail(`faucet_status failed: ${errorMessage(e)}`);
    }
  },
};
