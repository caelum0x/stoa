import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

const erc4626Abi = [
  {
    type: "function",
    name: "convertToAssets",
    stateMutability: "view",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const vaultConvertToAssetsSchema = z.object({
  vault: addressSchema.describe("ERC-4626 vault contract address."),
  shares: baseUnitsSchema.describe("Share amount in base units to convert."),
});

/// SKILL: erc4626_convert_to_assets — convert vault shares to underlying assets.
export const vaultConvertToAssetsAction: Action<typeof vaultConvertToAssetsSchema> = {
  name: "ERC4626_CONVERT_TO_ASSETS",
  similes: ["shares to assets", "convert shares", "vault redeem value", "erc4626 convert"],
  description: "Convert a given amount of ERC-4626 vault shares to the equivalent underlying assets.",
  examples: [
    {
      input: { vault: "0xVault", shares: "1000" },
      output: ok("Converted to assets", { assets: "1050" }),
      explanation: "Converts 1000 shares to assets.",
    },
  ],
  schema: vaultConvertToAssetsSchema,
  handler: async (agent, input) => {
    try {
      const assets = await agent.publicClient.readContract({
        address: input.vault,
        abi: erc4626Abi,
        functionName: "convertToAssets",
        args: [BigInt(input.shares)],
      });
      return ok("Converted to assets", { vault: input.vault, shares: input.shares, assets: assets.toString() });
    } catch (e) {
      return fail(`erc4626_convert_to_assets failed: ${errorMessage(e)}`);
    }
  },
};
