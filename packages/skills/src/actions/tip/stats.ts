import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { tipJarAbi } from "../../abi/tipJar.js";
import { addressSchema } from "../../schemas.js";

export const tipStatsSchema = z.object({
  address: addressSchema.optional().describe("Account to inspect. Defaults to the agent."),
});

/// SKILL: tip_stats — withdrawable balance plus lifetime tips received and given.
export const tipStatsAction: Action<typeof tipStatsSchema> = {
  name: "TIP_STATS",
  similes: ["tip stats", "tip balance", "tips received", "tips given", "tip totals"],
  description: "Read TipJar stats for an account: withdrawable balance, total received, and total given, all in PHRS.",
  examples: [
    {
      input: {},
      output: ok("Tip stats", { balance: "1.5", totalReceived: "3.0", totalGiven: "0.5" }),
      explanation: "Reads the agent's tip stats.",
    },
  ],
  schema: tipStatsSchema,
  handler: async (agent, input) => {
    try {
      const jar = agent.requireContract("tipJar");
      const account = input.address ?? agent.address;
      const [balance, totalReceived, totalGiven] = await Promise.all([
        agent.publicClient.readContract({ address: jar, abi: tipJarAbi, functionName: "balance", args: [account] }),
        agent.publicClient.readContract({ address: jar, abi: tipJarAbi, functionName: "totalReceived", args: [account] }),
        agent.publicClient.readContract({ address: jar, abi: tipJarAbi, functionName: "totalGiven", args: [account] }),
      ]);
      return ok("Tip stats", {
        account,
        balance: formatEther(balance),
        totalReceived: formatEther(totalReceived),
        totalGiven: formatEther(totalGiven),
      });
    } catch (e) {
      return fail(`tip_stats failed: ${errorMessage(e)}`);
    }
  },
};
