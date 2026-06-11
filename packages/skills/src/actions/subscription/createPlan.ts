import { z } from "zod";
import { parseEther, parseEventLogs } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { subscriptionManagerAbi } from "../../abi/subscriptionManager.js";
import { decimalAmountSchema } from "../../schemas.js";

export const subscriptionCreatePlanSchema = z.object({
  price: decimalAmountSchema.describe("Per-period price in native PHRS, human units."),
  period: z.coerce.number().int().positive().describe("Billing period length in seconds."),
});

/// SKILL: subscription_create_plan — register a recurring billing plan on SubscriptionManager.
export const subscriptionCreatePlanAction: Action<typeof subscriptionCreatePlanSchema> = {
  name: "SUBSCRIPTION_CREATE_PLAN",
  similes: ["create plan", "new subscription plan", "register plan", "add billing plan"],
  description: "Create a recurring subscription plan with a native PHRS price charged every period seconds.",
  examples: [
    {
      input: { price: "1.5", period: 2592000 },
      output: ok("Plan created", { planId: "1", txHash: "0x..." }),
      explanation: "Creates a plan billing 1.5 PHRS every 30 days.",
    },
  ],
  schema: subscriptionCreatePlanSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("subscriptions");
      const hash = await agent.walletClient.writeContract({
        address: mgr,
        abi: subscriptionManagerAbi,
        functionName: "createPlan",
        args: [parseEther(input.price), BigInt(input.period)],
      });
      const receipt = await agent.publicClient.waitForTransactionReceipt({ hash });
      const events = parseEventLogs({ abi: subscriptionManagerAbi, logs: receipt.logs, eventName: "PlanCreated" });
      const planId = events[0]?.args.planId;
      return ok("Plan created", {
        planId: planId !== undefined ? planId.toString() : undefined,
        price: input.price,
        period: input.period,
        txHash: hash,
      });
    } catch (e) {
      return fail(`subscription_create_plan failed: ${errorMessage(e)}`);
    }
  },
};
