import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { subscriptionManagerAbi } from "../../abi/subscriptionManager.js";

export const subscriptionChargeSchema = z.object({
  subId: z.coerce.number().int().positive().describe("Subscription id to charge."),
});

/// SKILL: subscription_charge — pull a due payment from a subscription's balance.
export const subscriptionChargeAction: Action<typeof subscriptionChargeSchema> = {
  name: "SUBSCRIPTION_CHARGE",
  similes: ["charge subscription", "bill subscription", "collect payment", "run billing"],
  description: "Charge a due subscription on SubscriptionManager, debiting its balance and advancing the next charge time.",
  examples: [
    {
      input: { subId: 7 },
      output: ok("Subscription charged", { txHash: "0x..." }),
      explanation: "Collects the next period's payment from subscription 7.",
    },
  ],
  schema: subscriptionChargeSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("subscriptions");
      const hash = await agent.walletClient.writeContract({
        address: mgr,
        abi: subscriptionManagerAbi,
        functionName: "charge",
        args: [BigInt(input.subId)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Subscription charged", { subId: input.subId, txHash: hash });
    } catch (e) {
      return fail(`subscription_charge failed: ${errorMessage(e)}`);
    }
  },
};
