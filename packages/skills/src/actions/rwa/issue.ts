import { z } from "zod";
import { parseEventLogs } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { rwaRegistryAbi } from "../../abi/rwaRegistry.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

export const rwaIssueSchema = z.object({
  holder: addressSchema.describe("Address that will hold the RWA receipt."),
  assetType: z.string().min(1).describe('Asset type, e.g. "invoice", "tbill", "real-estate".'),
  valuation: baseUnitsSchema.describe("Valuation in base units (informational)."),
  metadataURI: z.string().optional().describe("URI to the asset document / legal wrapper."),
});

/// SKILL: rwa_issue — issue a tokenized real-world-asset receipt to a holder.
export const rwaIssueAction: Action<typeof rwaIssueSchema> = {
  name: "RWA_ISSUE",
  similes: ["issue rwa", "tokenize asset", "mint receipt", "register real world asset"],
  description: "Issue a real-world-asset receipt (type, valuation, metadata) to a holder in the RwaRegistry.",
  examples: [
    {
      input: { holder: "0xabc", assetType: "invoice", valuation: "1000000000" },
      output: ok("RWA issued", { assetId: 1, txHash: "0x..." }),
      explanation: "Tokenizes a $1,000 invoice receipt.",
    },
  ],
  schema: rwaIssueSchema,
  handler: async (agent, input) => {
    try {
      const reg = agent.requireContract("rwa");
      const hash = await agent.walletClient.writeContract({
        address: reg,
        abi: rwaRegistryAbi,
        functionName: "issue",
        args: [input.holder, input.assetType, BigInt(input.valuation), input.metadataURI ?? ""],
      });
      const receipt = await agent.publicClient.waitForTransactionReceipt({ hash });
      const events = parseEventLogs({ abi: rwaRegistryAbi, logs: receipt.logs, eventName: "Issued" });
      const assetId = events[0]?.args.assetId;
      return ok("RWA issued", {
        assetId: assetId !== undefined ? Number(assetId) : undefined,
        holder: input.holder,
        txHash: hash,
      });
    } catch (e) {
      return fail(`rwa_issue failed: ${errorMessage(e)}`);
    }
  },
};
