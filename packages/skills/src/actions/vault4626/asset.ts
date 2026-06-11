import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const erc4626Abi = [
  {
    type: "function",
    name: "asset",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export const vaultAssetSchema = z.object({
  vault: addressSchema.describe("ERC-4626 vault contract address."),
});

/// SKILL: erc4626_asset — underlying asset token address of a vault.
export const vaultAssetAction: Action<typeof vaultAssetSchema> = {
  name: "VAULT_ASSET",
  similes: ["vault asset", "underlying token", "erc4626 asset", "vault underlying"],
  description: "Return the address of the underlying asset token managed by an ERC-4626 vault.",
  examples: [
    {
      input: { vault: "0xVault" },
      output: ok("Vault asset", { asset: "0xUSDC" }),
      explanation: "Reads the vault's underlying asset address.",
    },
  ],
  schema: vaultAssetSchema,
  handler: async (agent, input) => {
    try {
      const asset = await agent.publicClient.readContract({
        address: input.vault,
        abi: erc4626Abi,
        functionName: "asset",
      });
      return ok("Vault asset", { vault: input.vault, asset });
    } catch (e) {
      return fail(`erc4626_asset failed: ${errorMessage(e)}`);
    }
  },
};
