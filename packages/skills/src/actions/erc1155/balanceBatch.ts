import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc1155Abi } from "../../abi/erc1155.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

export const erc1155BalanceBatchSchema = z.object({
  token: addressSchema.describe("ERC-1155 contract address."),
  accounts: z.array(addressSchema).min(1).describe("Holder addresses, paired with ids."),
  ids: z.array(baseUnitsSchema).min(1).describe("Token ids, paired with accounts."),
});

/// SKILL: erc1155_balance_batch — balances for paired (account, id) tuples.
export const erc1155BalanceBatchAction: Action<typeof erc1155BalanceBatchSchema> = {
  name: "ERC1155_BALANCE_BATCH",
  similes: ["erc1155 batch balance", "balanceofbatch", "multitoken batch balance", "1155 bulk balance"],
  description: "Return ERC-1155 balances for paired accounts and ids via balanceOfBatch on Pharos.",
  examples: [
    {
      input: { token: "0xNFT", accounts: ["0xabc"], ids: ["1"] },
      output: ok("ERC-1155 balances", { balances: ["3"] }),
      explanation: "Reads one (account, id) balance.",
    },
  ],
  schema: erc1155BalanceBatchSchema,
  handler: async (agent, input) => {
    try {
      if (input.accounts.length !== input.ids.length) {
        return fail("erc1155_balance_batch failed: accounts and ids must have the same length");
      }
      const balances = await agent.publicClient.readContract({
        address: input.token,
        abi: erc1155Abi,
        functionName: "balanceOfBatch",
        args: [input.accounts, input.ids.map((id) => BigInt(id))],
      });
      return ok("ERC-1155 balances", {
        token: input.token,
        accounts: input.accounts,
        ids: input.ids,
        balances: balances.map((b) => b.toString()),
      });
    } catch (e) {
      return fail(`erc1155_balance_batch failed: ${errorMessage(e)}`);
    }
  },
};
