import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const erc4626Abi = [
  {
    type: "function",
    name: "maxWithdraw",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const maxWithdrawSchema = z.object({
  vault: addressSchema.describe("ERC-4626 vault contract address."),
  owner: addressSchema.optional().describe("Share owner address. Defaults to the agent."),
});

/// SKILL: erc4626_max_withdraw — max assets an owner can withdraw from a vault.
export const maxWithdrawAction: Action<typeof maxWithdrawSchema> = {
  name: "MAX_WITHDRAW",
  similes: ["max withdraw", "maximum withdrawable", "withdraw limit", "erc4626 max withdraw"],
  description: "Return the maximum amount of underlying assets an owner can withdraw from an ERC-4626 vault.",
  examples: [
    {
      input: { vault: "0xVault" },
      output: ok("Max withdraw", { assets: "1048" }),
      explanation: "Reads the agent's max withdrawable assets.",
    },
  ],
  schema: maxWithdrawSchema,
  handler: async (agent, input) => {
    try {
      const owner = input.owner ?? agent.address;
      const assets = await agent.publicClient.readContract({
        address: input.vault,
        abi: erc4626Abi,
        functionName: "maxWithdraw",
        args: [owner],
      });
      return ok("Max withdraw", { vault: input.vault, owner, assets: assets.toString() });
    } catch (e) {
      return fail(`erc4626_max_withdraw failed: ${errorMessage(e)}`);
    }
  },
};
