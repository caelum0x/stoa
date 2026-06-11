import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const nativeTransferSchema = z.object({
  to: addressSchema.describe("Recipient address."),
  amount: decimalAmountSchema.describe("PHRS amount to send, human units."),
});

/// SKILL: native_transfer — send native PHRS.
export const nativeTransferAction: Action<typeof nativeTransferSchema> = {
  name: "NATIVE_TRANSFER",
  similes: ["send phrs", "transfer native", "send coins", "pay phrs"],
  description: "Send native PHRS from the agent to a recipient on Pharos.",
  examples: [
    {
      input: { to: "0xabc", amount: "0.25" },
      output: ok("Sent", { txHash: "0x..." }),
      explanation: "Sends 0.25 PHRS.",
    },
  ],
  schema: nativeTransferSchema,
  handler: async (agent, input) => {
    try {
      const hash = await agent.walletClient.sendTransaction({
        to: input.to,
        value: parseEther(input.amount),
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Sent", { to: input.to, amount: input.amount, txHash: hash });
    } catch (e) {
      return fail(`native_transfer failed: ${errorMessage(e)}`);
    }
  },
};
