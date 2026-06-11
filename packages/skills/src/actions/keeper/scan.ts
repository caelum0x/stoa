import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { subscriptionManagerAbi } from "../../abi/subscriptionManager.js";

export const keeperScanSchema = z.object({
  subIds: z.array(z.coerce.number().int().positive()).min(1).max(100).describe("Subscription ids to scan."),
  now: z.coerce.number().int().optional().describe("Unix time to evaluate against (defaults to chain block time)."),
});

/// SKILL: keeper_scan_subscriptions — find which subscriptions are due to be charged now.
export const keeperScanAction: Action<typeof keeperScanSchema> = {
  name: "KEEPER_SCAN_SUBSCRIPTIONS",
  similes: ["scan subscriptions", "which subs are due", "find chargeable", "subscription keeper"],
  description: "Scan subscriptions and report which are currently chargeable (active, past nextCharge, funded).",
  examples: [
    {
      input: { subIds: [1, 2, 3] },
      output: ok("Scanned subscriptions", { chargeable: [1, 3] }),
      explanation: "Reports which subscriptions a keeper should charge.",
    },
  ],
  schema: keeperScanSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("subscriptions");
      const now = input.now ?? Number((await agent.publicClient.getBlock()).timestamp);
      const results: Array<{ subId: number; chargeable: boolean; balance: string; nextCharge: number }> = [];
      const chargeable: number[] = [];

      for (const subId of input.subIds) {
        const [planId, , balance, nextCharge, active] = await agent.publicClient.readContract({
          address: mgr,
          abi: subscriptionManagerAbi,
          functionName: "subs",
          args: [BigInt(subId)],
        });
        const [, price] = await agent.publicClient.readContract({
          address: mgr,
          abi: subscriptionManagerAbi,
          functionName: "plans",
          args: [planId],
        });
        const due = active && now >= Number(nextCharge) && balance >= price;
        if (due) chargeable.push(subId);
        results.push({ subId, chargeable: due, balance: formatEther(balance), nextCharge: Number(nextCharge) });
      }

      return ok("Scanned subscriptions", { now, chargeable, details: results });
    } catch (e) {
      return fail(`keeper_scan_subscriptions failed: ${errorMessage(e)}`);
    }
  },
};
