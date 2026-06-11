import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { tipJarAbi } from "../../abi/tipJar.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const tipSendSchema = z.object({
  to: addressSchema.describe("Recipient address."),
  amount: decimalAmountSchema.describe("Tip amount in native PHRS, human units."),
  memo: z.string().optional().describe("Optional message attached to the tip."),
});

/// SKILL: tip_send — send a native PHRS tip with an optional memo.
export const tipSendAction: Action<typeof tipSendSchema> = {
  name: "TIP_SEND",
  similes: ["tip", "send tip", "leave a tip", "pay tip", "thank with tip"],
  description: "Send a native PHRS tip to a recipient through the TipJar contract, with an optional memo.",
  examples: [
    {
      input: { to: "0xabc", amount: "0.5", memo: "great work" },
      output: ok("Tip sent", { txHash: "0x..." }),
      explanation: "Tips 0.5 PHRS with a memo.",
    },
  ],
  schema: tipSendSchema,
  handler: async (agent, input) => {
    try {
      const jar = agent.requireContract("tipJar");
      const value = parseEther(input.amount);
      const hash = await agent.walletClient.writeContract({
        address: jar,
        abi: tipJarAbi,
        functionName: "tip",
        args: [input.to, input.memo ?? ""],
        value,
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Tip sent", {
        to: input.to,
        amount: input.amount,
        memo: input.memo ?? "",
        txHash: hash,
      });
    } catch (e) {
      return fail(`tip_send failed: ${errorMessage(e)}`);
    }
  },
};
