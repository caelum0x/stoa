import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { sessionKeyManagerAbi } from "../../abi/sessionKeyManager.js";
import { decimalAmountSchema } from "../../schemas.js";

export const sessionDepositSchema = z.object({
  amount: decimalAmountSchema.describe("Amount of native PHRS to deposit into the session key vault."),
});

/// SKILL: session_deposit — fund the session key manager with native PHRS.
export const sessionDepositAction: Action<typeof sessionDepositSchema> = {
  name: "SESSION_DEPOSIT",
  similes: ["deposit session funds", "fund session key", "top up session balance", "add session budget"],
  description: "Deposit native PHRS into the SessionKeyManager so authorized session keys can spend against it.",
  examples: [
    {
      input: { amount: "1.0" },
      output: ok("Session deposit complete", { txHash: "0x..." }),
      explanation: "Deposits 1 PHRS into the session vault.",
    },
  ],
  schema: sessionDepositSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("sessionKeys");
      const value = parseEther(input.amount);
      const hash = await agent.walletClient.writeContract({
        address: mgr,
        abi: sessionKeyManagerAbi,
        functionName: "deposit",
        args: [],
        value,
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Session deposit complete", {
        amount: input.amount,
        txHash: hash,
      });
    } catch (e) {
      return fail(`session_deposit failed: ${errorMessage(e)}`);
    }
  },
};
