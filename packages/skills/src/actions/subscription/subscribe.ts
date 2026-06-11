import { z } from "zod";
import { parseEther, parseEventLogs } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { subscriptionManagerAbi } from "../../abi/subscriptionManager.js";
import { decimalAmountSchema } from "../../schemas.js";

export const subscriptionSubscribeSchema = z.object({
  planId: z.coerce.number().int().positive().describe("Plan id to subscribe to."),
  fund: decimalAmountSchema.describe("Initial balance to fund the subscription, in native PHRS."),
});

/// SKILL: subscription_subscribe — subscribe to a plan and prefund its balance.
export const subscriptionSubscribeAction: Action<typeof subscriptionSubscribeSchema> = {
  name: "SUBSCRIPTION_SUBSCRIBE",
  similes: ["subscribe", "join plan", "start subscription", "sign up to plan"],
  description: "Subscribe to a billing plan on SubscriptionManager, funding the subscription with native PHRS.",
  examples: [
    {
      input: { planId: 1, fund: "5" },
      output: ok("Subscribed", { subId: "7", txHash: "0x..." }),
      explanation: "Subscribes to plan 1 with a 5 PHRS prefunded balance.",
    },
  ],
  schema: subscriptionSubscribeSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("subscriptions");
      const hash = await agent.walletClient.writeContract({
        address: mgr,
        abi: subscriptionManagerAbi,
        functionName: "subscribe",
        args: [BigInt(input.planId)],
        value: parseEther(input.fund),
      });
      const receipt = await agent.publicClient.waitForTransactionReceipt({ hash });
      const events = parseEventLogs({ abi: subscriptionManagerAbi, logs: receipt.logs, eventName: "Subscribed" });
      const subId = events[0]?.args.subId;
      return ok("Subscribed", {
        subId: subId !== undefined ? subId.toString() : undefined,
        planId: input.planId,
        fund: input.fund,
        txHash: hash,
      });
    } catch (e) {
      return fail(`subscription_subscribe failed: ${errorMessage(e)}`);
    }
  },
};
