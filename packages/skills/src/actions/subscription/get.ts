import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { subscriptionManagerAbi } from "../../abi/subscriptionManager.js";

export const subscriptionGetSchema = z.object({
  subId: z.coerce.number().int().positive().describe("Subscription id to read."),
});

/// SKILL: subscription_get — read a subscription's on-chain state.
export const subscriptionGetAction: Action<typeof subscriptionGetSchema> = {
  name: "SUBSCRIPTION_GET",
  similes: ["get subscription", "read subscription", "subscription status", "check subscription"],
  description: "Read a subscription's plan, subscriber, balance, next charge time, and active flag from SubscriptionManager.",
  examples: [
    {
      input: { subId: 7 },
      output: ok("Subscription read", { planId: "1", balance: "2.5", active: true }),
      explanation: "Returns the current state of subscription 7.",
    },
  ],
  schema: subscriptionGetSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("subscriptions");
      const [planId, subscriber, balance, nextCharge, active] = await agent.publicClient.readContract({
        address: mgr,
        abi: subscriptionManagerAbi,
        functionName: "subs",
        args: [BigInt(input.subId)],
      });
      return ok("Subscription read", {
        subId: input.subId,
        planId: planId.toString(),
        subscriber,
        balance: formatEther(balance),
        nextCharge: Number(nextCharge),
        active,
      });
    } catch (e) {
      return fail(`subscription_get failed: ${errorMessage(e)}`);
    }
  },
};
