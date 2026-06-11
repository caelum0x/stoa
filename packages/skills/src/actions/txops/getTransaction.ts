import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const getTransactionSchema = z.object({
  hash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Must be a 0x-prefixed 32-byte transaction hash")
    .transform((v) => v as `0x${string}`)
    .describe("Transaction hash to look up."),
});

/// SKILL: get_transaction — fetch a transaction by hash on Pharos.
export const getTransactionAction: Action<typeof getTransactionSchema> = {
  name: "GET_TRANSACTION",
  similes: ["get transaction", "tx details", "lookup tx", "fetch transaction"],
  description: "Fetch a transaction by hash on Pharos and return sender, recipient, value, nonce, and block.",
  examples: [
    {
      input: { hash: "0xabc" },
      output: ok("Transaction", { from: "0x...", to: "0x...", value: "1.0" }),
      explanation: "Reads a transaction by its hash.",
    },
  ],
  schema: getTransactionSchema,
  handler: async (agent, input) => {
    try {
      const tx = await agent.publicClient.getTransaction({ hash: input.hash });
      return ok("Transaction", {
        hash: input.hash,
        from: tx.from,
        to: tx.to,
        value: formatEther(tx.value),
        nonce: tx.nonce,
        blockNumber: tx.blockNumber !== null ? tx.blockNumber.toString() : null,
      });
    } catch (e) {
      return fail(`get_transaction failed: ${errorMessage(e)}`);
    }
  },
};
