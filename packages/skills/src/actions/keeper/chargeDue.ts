import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { subscriptionManagerAbi } from "../../abi/subscriptionManager.js";

export const keeperChargeDueSchema = z.object({
  subIds: z.array(z.coerce.number().int().positive()).min(1).max(50).describe("Subscription ids to attempt charging."),
});

/// SKILL: keeper_charge_due — charge each subscription that is due; skip those that revert.
export const keeperChargeDueAction: Action<typeof keeperChargeDueSchema> = {
  name: "KEEPER_CHARGE_DUE",
  similes: ["charge subscriptions", "run keeper", "collect subscriptions", "auto charge"],
  description: "Attempt to charge each given subscription; collects tx hashes for those that succeed.",
  examples: [
    {
      input: { subIds: [1, 2] },
      output: ok("Charged due subscriptions", { charged: 1 }),
      explanation: "Pulls payment for whichever subscriptions are due.",
    },
  ],
  schema: keeperChargeDueSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("subscriptions");
      const charged: Array<{ subId: number; txHash: string }> = [];
      const skipped: Array<{ subId: number; reason: string }> = [];

      for (const subId of input.subIds) {
        try {
          const hash = await agent.walletClient.writeContract({
            address: mgr,
            abi: subscriptionManagerAbi,
            functionName: "charge",
            args: [BigInt(subId)],
          });
          await agent.publicClient.waitForTransactionReceipt({ hash });
          charged.push({ subId, txHash: hash });
        } catch (e) {
          skipped.push({ subId, reason: errorMessage(e).slice(0, 80) });
        }
      }

      return ok("Charged due subscriptions", { charged: charged.length, txs: charged, skipped });
    } catch (e) {
      return fail(`keeper_charge_due failed: ${errorMessage(e)}`);
    }
  },
};
