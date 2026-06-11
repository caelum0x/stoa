import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { rwaRegistryAbi } from "../../abi/rwaRegistry.js";

export const rwaRedeemSchema = z.object({
  assetId: z.coerce.number().int().positive().describe("RWA asset id to redeem/settle."),
});

/// SKILL: rwa_redeem — mark an RWA receipt redeemed (settled).
export const rwaRedeemAction: Action<typeof rwaRedeemSchema> = {
  name: "RWA_REDEEM",
  similes: ["redeem rwa", "settle asset", "close receipt"],
  description: "Redeem (settle) a real-world-asset receipt. Callable by the holder or issuer.",
  examples: [
    {
      input: { assetId: 1 },
      output: ok("RWA redeemed", { txHash: "0x..." }),
      explanation: "Settles the asset receipt.",
    },
  ],
  schema: rwaRedeemSchema,
  handler: async (agent, input) => {
    try {
      const reg = agent.requireContract("rwa");
      const hash = await agent.walletClient.writeContract({
        address: reg,
        abi: rwaRegistryAbi,
        functionName: "redeem",
        args: [BigInt(input.assetId)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("RWA redeemed", { assetId: input.assetId, txHash: hash });
    } catch (e) {
      return fail(`rwa_redeem failed: ${errorMessage(e)}`);
    }
  },
};
