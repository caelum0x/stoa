import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { tipJarAbi } from "../../abi/tipJar.js";

export const tipWithdrawSchema = z.object({});

/// SKILL: tip_withdraw — withdraw the agent's accumulated tips from the TipJar.
export const tipWithdrawAction: Action<typeof tipWithdrawSchema> = {
  name: "TIP_WITHDRAW",
  similes: ["withdraw tips", "claim tips", "cash out tips", "collect tips"],
  description: "Withdraw all native PHRS tips accumulated for the agent in the TipJar contract.",
  examples: [
    {
      input: {},
      output: ok("Tips withdrawn", { txHash: "0x..." }),
      explanation: "Withdraws the agent's tip balance.",
    },
  ],
  schema: tipWithdrawSchema,
  handler: async (agent) => {
    try {
      const jar = agent.requireContract("tipJar");
      const hash = await agent.walletClient.writeContract({
        address: jar,
        abi: tipJarAbi,
        functionName: "withdraw",
        args: [],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Tips withdrawn", { txHash: hash });
    } catch (e) {
      return fail(`tip_withdraw failed: ${errorMessage(e)}`);
    }
  },
};
