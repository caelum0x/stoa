import { z } from "zod";
import { parseUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc20Abi } from "../../abi/erc20.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const erc20TransferSchema = z.object({
  token: addressSchema.describe("ERC-20 token contract address."),
  to: addressSchema.describe("Recipient address."),
  amount: decimalAmountSchema.describe("Amount to transfer, human units."),
});

/// SKILL: erc20_transfer — transfer ERC-20 tokens.
export const erc20TransferAction: Action<typeof erc20TransferSchema> = {
  name: "ERC20_TRANSFER",
  similes: ["send token", "transfer erc20", "pay token", "send usdc"],
  description: "Transfer ERC-20 tokens from the agent to a recipient on Pharos.",
  examples: [
    {
      input: { token: "0xUSDC", to: "0xabc", amount: "10" },
      output: ok("Transfer sent", { txHash: "0x..." }),
      explanation: "Sends 10 tokens.",
    },
  ],
  schema: erc20TransferSchema,
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
        functionName: "transfer",
        args: [input.to, value],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Transfer sent", { token: input.token, to: input.to, amount: input.amount, txHash: hash });
    } catch (e) {
      return fail(`erc20_transfer failed: ${errorMessage(e)}`);
    }
  },
};
