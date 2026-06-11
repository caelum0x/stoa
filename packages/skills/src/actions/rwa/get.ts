import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { rwaRegistryAbi } from "../../abi/rwaRegistry.js";
import { addressSchema } from "../../schemas.js";

export const rwaGetSchema = z.object({
  op: z.enum(["asset", "holdings"]).describe("Read a single asset or a holder's asset ids."),
  assetId: z.coerce.number().int().positive().optional().describe("Asset id (op=asset)."),
  holder: addressSchema.optional().describe("Holder address (op=holdings). Defaults to agent."),
});

/// SKILL: rwa_get — read an RWA receipt or a holder's holdings.
export const rwaGetAction: Action<typeof rwaGetSchema> = {
  name: "RWA_GET",
  similes: ["get rwa", "read asset", "rwa holdings", "list receipts"],
  description: "Read a real-world-asset receipt by id, or list the asset ids ever held by an address.",
  examples: [
    {
      input: { op: "asset", assetId: 1 },
      output: ok("RWA asset", { assetType: "invoice", redeemed: false }),
      explanation: "Reads a single RWA receipt.",
    },
  ],
  schema: rwaGetSchema,
  handler: async (agent, input) => {
    try {
      const reg = agent.requireContract("rwa");
      if (input.op === "asset") {
        if (input.assetId === undefined) return fail("assetId is required for op=asset.");
        const a = await agent.publicClient.readContract({
          address: reg,
          abi: rwaRegistryAbi,
          functionName: "getAsset",
          args: [BigInt(input.assetId)],
        });
        return ok("RWA asset", {
          assetId: input.assetId,
          issuer: a.issuer,
          holder: a.holder,
          assetType: a.assetType,
          valuation: a.valuation.toString(),
          metadataURI: a.metadataURI,
          redeemed: a.redeemed,
        });
      }

      const holder = input.holder ?? agent.address;
      const ids = await agent.publicClient.readContract({
        address: reg,
        abi: rwaRegistryAbi,
        functionName: "assetsByHolder",
        args: [holder],
      });
      return ok("RWA holdings", { holder, assetIds: ids.map(Number) });
    } catch (e) {
      return fail(`rwa_get failed: ${errorMessage(e)}`);
    }
  },
};
