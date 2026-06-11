import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { subscriptionManagerAbi } from "../../abi/subscriptionManager.js";

export const subscriptionCancelSchema = z.object({
  subId: z.coerce.number().int().positive().describe("Subscription id to cancel."),
});

/// SKILL: subscription_cancel — cancel an active subscription.
export const subscriptionCancelAction: Action<typeof subscriptionCancelSchema> = {
  name: "SUBSCRIPTION_CANCEL",
  similes: ["cancel subscription", "stop subscription", "unsubscribe", "end subscription"],
  description: "Cancel an active subscription on SubscriptionManager, stopping future charges.",
  examples: [
    {
      input: { subId: 7 },
      output: ok("Subscription cancelled", { txHash: "0x..." }),
      explanation: "Cancels subscription 7.",
    },
  ],
  schema: subscriptionCancelSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("subscriptions");
      const hash = await agent.walletClient.writeContract({
        address: mgr,
        abi: subscriptionManagerAbi,
        functionName: "cancel",
        args: [BigInt(input.subId)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Subscription cancelled", { subId: input.subId, txHash: hash });
    } catch (e) {
      return fail(`subscription_cancel failed: ${errorMessage(e)}`);
    }
  },
};
