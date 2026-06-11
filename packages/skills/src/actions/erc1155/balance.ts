import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc1155Abi } from "../../abi/erc1155.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

export const erc1155BalanceSchema = z.object({
  token: addressSchema.describe("ERC-1155 contract address."),
  account: addressSchema.optional().describe("Holder address. Defaults to the agent."),
  id: baseUnitsSchema.describe("Token id (integer string)."),
});

/// SKILL: erc1155_balance — balance of a single token id for an account.
export const erc1155BalanceAction: Action<typeof erc1155BalanceSchema> = {
  name: "ERC1155_BALANCE",
  similes: ["erc1155 balance", "multitoken balance", "1155 balanceof", "how many of token id"],
  description: "Return the ERC-1155 balance of a given token id for an account on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", id: "1" },
      output: ok("ERC-1155 balance", { balance: "3" }),
      explanation: "Reads the agent's balance of token id 1.",
    },
  ],
  schema: erc1155BalanceSchema,
  handler: async (agent, input) => {
    try {
      const account = input.account ?? agent.address;
      const balance = await agent.publicClient.readContract({
        address: input.token,
        abi: erc1155Abi,
        functionName: "balanceOf",
        args: [account, BigInt(input.id)],
      });
      return ok("ERC-1155 balance", {
        token: input.token,
        account,
        id: input.id,
        balance: balance.toString(),
      });
    } catch (e) {
      return fail(`erc1155_balance failed: ${errorMessage(e)}`);
    }
  },
};
