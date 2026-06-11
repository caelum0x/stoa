import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { sessionKeyManagerAbi } from "../../abi/sessionKeyManager.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const sessionSpendSchema = z.object({
  owner: addressSchema.describe("Owner address whose deposited funds back this spend."),
  to: addressSchema.describe("Recipient of the spent native PHRS."),
  amount: decimalAmountSchema.describe("Amount of native PHRS to spend, within the authorized cap."),
});

/// SKILL: session_spend — spend an owner's deposited PHRS as their authorized session key.
export const sessionSpendAction: Action<typeof sessionSpendSchema> = {
  name: "SESSION_SPEND",
  similes: ["spend session funds", "use session key", "delegated spend", "pay from session budget"],
  description: "As an authorized session key, spend an owner's deposited PHRS to a recipient via the SessionKeyManager.",
  examples: [
    {
      input: { owner: "0xowner", to: "0xabc", amount: "0.25" },
      output: ok("Session spend complete", { txHash: "0x..." }),
      explanation: "Spends 0.25 PHRS from the owner's session budget to the recipient.",
    },
  ],
  schema: sessionSpendSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("sessionKeys");
      const hash = await agent.walletClient.writeContract({
        address: mgr,
        abi: sessionKeyManagerAbi,
        functionName: "spend",
        args: [input.owner, input.to, parseEther(input.amount)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Session spend complete", {
        owner: input.owner,
        to: input.to,
        amount: input.amount,
        txHash: hash,
      });
    } catch (e) {
      return fail(`session_spend failed: ${errorMessage(e)}`);
    }
  },
};
