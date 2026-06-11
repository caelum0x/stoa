import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const erc4626Abi = [
  {
    type: "function",
    name: "totalAssets",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const vaultTotalAssetsSchema = z.object({
  vault: addressSchema.describe("ERC-4626 vault contract address."),
});

/// SKILL: erc4626_total_assets — total underlying assets held by an ERC-4626 vault.
export const vaultTotalAssetsAction: Action<typeof vaultTotalAssetsSchema> = {
  name: "ERC4626_TOTAL_ASSETS",
  similes: ["vault total assets", "erc4626 tvl", "vault holdings", "underlying assets"],
  description: "Return the total amount of underlying assets managed by an ERC-4626 vault.",
  examples: [
    {
      input: { vault: "0xVault" },
      output: ok("Total assets", { totalAssets: "1000000" }),
      explanation: "Reads the vault's total assets.",
    },
  ],
  schema: vaultTotalAssetsSchema,
  handler: async (agent, input) => {
    try {
      const total = await agent.publicClient.readContract({
        address: input.vault,
        abi: erc4626Abi,
        functionName: "totalAssets",
      });
      return ok("Total assets", { vault: input.vault, totalAssets: total.toString() });
    } catch (e) {
      return fail(`erc4626_total_assets failed: ${errorMessage(e)}`);
    }
  },
};
