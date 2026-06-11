import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

const erc4626Abi = [
  {
    type: "function",
    name: "previewRedeem",
    stateMutability: "view",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const vaultPreviewRedeemSchema = z.object({
  vault: addressSchema.describe("ERC-4626 vault contract address."),
  shares: baseUnitsSchema.describe("Share amount in base units to preview redeeming."),
});

/// SKILL: erc4626_preview_redeem — preview assets returned for redeeming vault shares.
export const vaultPreviewRedeemAction: Action<typeof vaultPreviewRedeemSchema> = {
  name: "ERC4626_PREVIEW_REDEEM",
  similes: ["preview redeem", "redeem preview", "vault withdraw estimate", "erc4626 redeem"],
  description: "Preview the amount of underlying assets returned for redeeming a given number of ERC-4626 vault shares.",
  examples: [
    {
      input: { vault: "0xVault", shares: "1000" },
      output: ok("Preview redeem", { assets: "1048" }),
      explanation: "Previews redeeming 1000 shares.",
    },
  ],
  schema: vaultPreviewRedeemSchema,
  handler: async (agent, input) => {
    try {
      const assets = await agent.publicClient.readContract({
        address: input.vault,
        abi: erc4626Abi,
        functionName: "previewRedeem",
        args: [BigInt(input.shares)],
      });
      return ok("Preview redeem", { vault: input.vault, shares: input.shares, assets: assets.toString() });
    } catch (e) {
      return fail(`erc4626_preview_redeem failed: ${errorMessage(e)}`);
    }
  },
};
