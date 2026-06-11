import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { faucetAbi } from "../../abi/faucet.js";
import { decimalAmountSchema } from "../../schemas.js";

export const faucetFundSchema = z.object({
  amount: decimalAmountSchema.describe("Native PHRS to deposit into the faucet, human units."),
});

/// SKILL: faucet_fund — top up the testnet faucet with native PHRS.
export const faucetFundAction: Action<typeof faucetFundSchema> = {
  name: "FAUCET_FUND",
  similes: ["fund faucet", "top up faucet", "donate to faucet", "refill faucet"],
  description: "Deposit native PHRS into the Pharos testnet faucet so others can drip.",
  examples: [
    {
      input: { amount: "1.0" },
      output: ok("Faucet funded", { txHash: "0x..." }),
      explanation: "Funds the faucet with 1 PHRS.",
    },
  ],
  schema: faucetFundSchema,
  handler: async (agent, input) => {
    try {
      const faucet = agent.requireContract("faucet");
      const value = parseEther(input.amount);
      const hash = await agent.walletClient.writeContract({
        address: faucet,
        abi: faucetAbi,
        functionName: "fund",
        args: [],
        value,
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Faucet funded", { faucet, amount: input.amount, txHash: hash });
    } catch (e) {
      return fail(`faucet_fund failed: ${errorMessage(e)}`);
    }
  },
};
