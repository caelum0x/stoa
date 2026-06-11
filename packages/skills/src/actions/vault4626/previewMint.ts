import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

const erc4626Abi = [
  {
    type: "function",
    name: "previewMint",
    stateMutability: "view",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const previewMintSchema = z.object({
  vault: addressSchema.describe("ERC-4626 vault contract address."),
  shares: baseUnitsSchema.describe("Share amount in base units to preview minting."),
});

/// SKILL: erc4626_preview_mint — preview assets required to mint shares.
export const previewMintAction: Action<typeof previewMintSchema> = {
  name: "PREVIEW_MINT",
  similes: ["preview mint", "mint preview", "assets for mint", "erc4626 mint estimate"],
  description: "Preview the amount of underlying assets required to mint a given number of ERC-4626 vault shares.",
  examples: [
    {
      input: { vault: "0xVault", shares: "1000" },
      output: ok("Preview mint", { assets: "1048" }),
      explanation: "Previews minting 1000 shares.",
    },
  ],
  schema: previewMintSchema,
  handler: async (agent, input) => {
    try {
      const assets = await agent.publicClient.readContract({
        address: input.vault,
        abi: erc4626Abi,
        functionName: "previewMint",
        args: [BigInt(input.shares)],
      });
      return ok("Preview mint", { vault: input.vault, shares: input.shares, assets: assets.toString() });
    } catch (e) {
      return fail(`erc4626_preview_mint failed: ${errorMessage(e)}`);
    }
  },
};
