import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

const erc4626Abi = [
  {
    type: "function",
    name: "convertToShares",
    stateMutability: "view",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const vaultConvertToSharesSchema = z.object({
  vault: addressSchema.describe("ERC-4626 vault contract address."),
  assets: baseUnitsSchema.describe("Asset amount in base units to convert."),
});

/// SKILL: erc4626_convert_to_shares — convert underlying assets to vault shares.
export const vaultConvertToSharesAction: Action<typeof vaultConvertToSharesSchema> = {
  name: "ERC4626_CONVERT_TO_SHARES",
  similes: ["assets to shares", "convert assets", "vault deposit value", "erc4626 shares"],
  description: "Convert a given amount of underlying assets to the equivalent ERC-4626 vault shares.",
  examples: [
    {
      input: { vault: "0xVault", assets: "1050" },
      output: ok("Converted to shares", { shares: "1000" }),
      explanation: "Converts 1050 assets to shares.",
    },
  ],
  schema: vaultConvertToSharesSchema,
  handler: async (agent, input) => {
    try {
      const shares = await agent.publicClient.readContract({
        address: input.vault,
        abi: erc4626Abi,
        functionName: "convertToShares",
        args: [BigInt(input.assets)],
      });
      return ok("Converted to shares", { vault: input.vault, assets: input.assets, shares: shares.toString() });
    } catch (e) {
      return fail(`erc4626_convert_to_shares failed: ${errorMessage(e)}`);
    }
  },
};
