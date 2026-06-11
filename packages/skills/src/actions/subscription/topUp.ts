import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { subscriptionManagerAbi } from "../../abi/subscriptionManager.js";
import { decimalAmountSchema } from "../../schemas.js";

export const subscriptionTopUpSchema = z.object({
  subId: z.coerce.number().int().positive().describe("Subscription id to top up."),
  amount: decimalAmountSchema.describe("Amount to add to the subscription balance, in native PHRS."),
});

/// SKILL: subscription_topup — add native PHRS to a subscription's balance.
export const subscriptionTopUpAction: Action<typeof subscriptionTopUpSchema> = {
  name: "SUBSCRIPTION_TOPUP",
  similes: ["top up subscription", "fund subscription", "add balance", "refill subscription"],
  description: "Top up a subscription's balance with native PHRS so future charges can be collected.",
  examples: [
    {
      input: { subId: 7, amount: "3" },
      output: ok("Subscription topped up", { txHash: "0x..." }),
      explanation: "Adds 3 PHRS to subscription 7's balance.",
    },
  ],
  schema: subscriptionTopUpSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("subscriptions");
      const hash = await agent.walletClient.writeContract({
        address: mgr,
        abi: subscriptionManagerAbi,
        functionName: "topUp",
        args: [BigInt(input.subId)],
        value: parseEther(input.amount),
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Subscription topped up", { subId: input.subId, amount: input.amount, txHash: hash });
    } catch (e) {
      return fail(`subscription_topup failed: ${errorMessage(e)}`);
    }
  },
};
