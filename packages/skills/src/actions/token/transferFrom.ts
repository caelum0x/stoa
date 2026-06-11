import { z } from "zod";
import { parseUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc20Abi } from "../../abi/erc20.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const erc20TransferFromSchema = z.object({
  token: addressSchema.describe("ERC-20 token contract address."),
  from: addressSchema.describe("Address to debit (must have approved the agent)."),
  to: addressSchema.describe("Recipient address."),
  amount: decimalAmountSchema.describe("Amount to transfer, human units."),
});

/// SKILL: erc20_transfer_from — move tokens on behalf of an approver.
export const erc20TransferFromAction: Action<typeof erc20TransferFromSchema> = {
  name: "ERC20_TRANSFER_FROM",
  similes: ["transfer from", "pull tokens", "spend allowance"],
  description: "Transfer ERC-20 tokens from an approving owner to a recipient, using the agent's allowance.",
  examples: [
    {
      input: { token: "0xUSDC", from: "0xOwner", to: "0xDest", amount: "5" },
      output: ok("TransferFrom sent", { txHash: "0x..." }),
      explanation: "Pulls 5 approved tokens.",
    },
  ],
  schema: erc20TransferFromSchema,
  handler: async (agent, input) => {
    try {
      const decimals = await agent.publicClient.readContract({
        address: input.token,
        abi: erc20Abi,
        functionName: "decimals",
      });
      const value = parseUnits(input.amount, Number(decimals));
      const hash = await agent.walletClient.writeContract({
        address: input.token,
        abi: erc20Abi,
        functionName: "transferFrom",
        args: [input.from, input.to, value],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("TransferFrom sent", { token: input.token, from: input.from, to: input.to, txHash: hash });
    } catch (e) {
      return fail(`erc20_transfer_from failed: ${errorMessage(e)}`);
    }
  },
};
