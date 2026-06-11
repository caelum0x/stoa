import { z } from "zod";
import { parseUnits, maxUint256 } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc20Abi } from "../../abi/erc20.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const erc20ApproveSchema = z.object({
  token: addressSchema.describe("ERC-20 token contract address."),
  spender: addressSchema.describe("Spender to approve."),
  amount: decimalAmountSchema.optional().describe("Amount to approve, human units. Omit for unlimited."),
});

/// SKILL: erc20_approve — approve a spender to move the agent's tokens.
export const erc20ApproveAction: Action<typeof erc20ApproveSchema> = {
  name: "ERC20_APPROVE",
  similes: ["approve token", "set allowance", "approve spender", "infinite approval"],
  description: "Approve a spender to transfer the agent's ERC-20 tokens on Pharos.",
  examples: [
    {
      input: { token: "0xUSDC", spender: "0xRouter", amount: "100" },
      output: ok("Approved", { txHash: "0x..." }),
      explanation: "Approves a router for 100 tokens.",
    },
  ],
  schema: erc20ApproveSchema,
  handler: async (agent, input) => {
    try {
      let value = maxUint256;
      if (input.amount !== undefined) {
        const decimals = await agent.publicClient.readContract({
          address: input.token,
          abi: erc20Abi,
          functionName: "decimals",
        });
        value = parseUnits(input.amount, Number(decimals));
      }
      const hash = await agent.walletClient.writeContract({
        address: input.token,
        abi: erc20Abi,
        functionName: "approve",
        args: [input.spender, value],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Approved", {
        token: input.token,
        spender: input.spender,
        amount: input.amount ?? "unlimited",
        txHash: hash,
      });
    } catch (e) {
      return fail(`erc20_approve failed: ${errorMessage(e)}`);
    }
  },
};
