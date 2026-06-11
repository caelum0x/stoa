import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

const erc4626Abi = [
  {
    type: "function",
    name: "previewDeposit",
    stateMutability: "view",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const previewDepositSchema = z.object({
  vault: addressSchema.describe("ERC-4626 vault contract address."),
  assets: baseUnitsSchema.describe("Asset amount in base units to preview depositing."),
});

/// SKILL: erc4626_preview_deposit — preview shares minted for depositing assets.
export const previewDepositAction: Action<typeof previewDepositSchema> = {
  name: "PREVIEW_DEPOSIT",
  similes: ["preview deposit", "deposit preview", "shares for deposit", "erc4626 deposit estimate"],
  description: "Preview the number of ERC-4626 vault shares minted for depositing a given amount of underlying assets.",
  examples: [
    {
      input: { vault: "0xVault", assets: "1000" },
      output: ok("Preview deposit", { shares: "954" }),
      explanation: "Previews depositing 1000 assets.",
    },
  ],
  schema: previewDepositSchema,
  handler: async (agent, input) => {
    try {
      const shares = await agent.publicClient.readContract({
        address: input.vault,
        abi: erc4626Abi,
        functionName: "previewDeposit",
        args: [BigInt(input.assets)],
      });
      return ok("Preview deposit", { vault: input.vault, assets: input.assets, shares: shares.toString() });
    } catch (e) {
      return fail(`erc4626_preview_deposit failed: ${errorMessage(e)}`);
    }
  },
};
