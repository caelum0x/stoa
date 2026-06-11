import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { rwaRegistryAbi } from "../../abi/rwaRegistry.js";
import { addressSchema } from "../../schemas.js";

export const rwaTransferSchema = z.object({
  assetId: z.coerce.number().int().positive().describe("RWA asset id."),
  to: addressSchema.describe("New holder address."),
});

/// SKILL: rwa_transfer — transfer an RWA receipt to a new holder.
export const rwaTransferAction: Action<typeof rwaTransferSchema> = {
  name: "RWA_TRANSFER",
  similes: ["transfer rwa", "move asset", "assign receipt"],
  description: "Transfer a real-world-asset receipt you hold to another address.",
  examples: [
    {
      input: { assetId: 1, to: "0xdef" },
      output: ok("RWA transferred", { txHash: "0x..." }),
      explanation: "Transfers the receipt to a new holder.",
    },
  ],
  schema: rwaTransferSchema,
  handler: async (agent, input) => {
    try {
      const reg = agent.requireContract("rwa");
      const hash = await agent.walletClient.writeContract({
        address: reg,
        abi: rwaRegistryAbi,
        functionName: "transfer",
        args: [BigInt(input.assetId), input.to],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("RWA transferred", { assetId: input.assetId, to: input.to, txHash: hash });
    } catch (e) {
      return fail(`rwa_transfer failed: ${errorMessage(e)}`);
    }
  },
};
