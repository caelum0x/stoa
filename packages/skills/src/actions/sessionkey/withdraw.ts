import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { sessionKeyManagerAbi } from "../../abi/sessionKeyManager.js";
import { decimalAmountSchema } from "../../schemas.js";

export const sessionWithdrawSchema = z.object({
  amount: decimalAmountSchema.describe("Amount of native PHRS to withdraw from your session vault balance."),
});

/// SKILL: session_withdraw — withdraw unspent native PHRS from the session key vault.
export const sessionWithdrawAction: Action<typeof sessionWithdrawSchema> = {
  name: "SESSION_WITHDRAW",
  similes: ["withdraw session funds", "reclaim session balance", "pull session deposit", "cash out session"],
  description: "Withdraw unspent native PHRS from your SessionKeyManager balance back to your wallet.",
  examples: [
    {
      input: { amount: "0.5" },
      output: ok("Session withdrawal complete", { txHash: "0x..." }),
      explanation: "Withdraws 0.5 PHRS from the session vault.",
    },
  ],
  schema: sessionWithdrawSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("sessionKeys");
      const hash = await agent.walletClient.writeContract({
        address: mgr,
        abi: sessionKeyManagerAbi,
        functionName: "withdraw",
        args: [parseEther(input.amount)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Session withdrawal complete", {
        amount: input.amount,
        txHash: hash,
      });
    } catch (e) {
      return fail(`session_withdraw failed: ${errorMessage(e)}`);
    }
  },
};
