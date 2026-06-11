import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const nativeMultisendSchema = z.object({
  payments: z
    .array(z.object({ to: addressSchema, amount: decimalAmountSchema }))
    .min(1)
    .max(50)
    .describe("List of { to, amount } native PHRS payments."),
});

/// SKILL: native_multisend — send PHRS to many recipients (sequential).
export const nativeMultisendAction: Action<typeof nativeMultisendSchema> = {
  name: "NATIVE_MULTISEND",
  similes: ["batch send", "airdrop phrs", "pay many", "multisend"],
  description: "Send native PHRS to multiple recipients in sequence; returns a tx hash per payment.",
  examples: [
    {
      input: { payments: [{ to: "0xa", amount: "0.1" }, { to: "0xb", amount: "0.2" }] },
      output: ok("Multisend complete", { count: 2 }),
      explanation: "Pays two recipients.",
    },
  ],
  schema: nativeMultisendSchema,
  handler: async (agent, input) => {
    try {
      const results: Array<{ to: string; amount: string; txHash: string }> = [];
      for (const p of input.payments) {
        const hash = await agent.walletClient.sendTransaction({ to: p.to, value: parseEther(p.amount) });
        await agent.publicClient.waitForTransactionReceipt({ hash });
        results.push({ to: p.to, amount: p.amount, txHash: hash });
      }
      return ok("Multisend complete", { count: results.length, payments: results });
    } catch (e) {
      return fail(`native_multisend failed: ${errorMessage(e)}`);
    }
  },
};
