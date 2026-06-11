import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const txStatusSchema = z.object({
  hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Must be a 0x tx hash").describe("Transaction hash."),
});

/// SKILL: get_tx_status — success/failure + confirmations for a transaction.
export const txStatusAction: Action<typeof txStatusSchema> = {
  name: "GET_TX_STATUS",
  similes: ["transaction status", "tx confirmed", "did tx succeed", "receipt status"],
  description: "Return whether a transaction succeeded, its block, and gas used on Pharos.",
  examples: [
    {
      input: { hash: "0xabc...", },
      output: ok("Tx status", { status: "success" }),
      explanation: "Checks a transaction's receipt.",
    },
  ],
  schema: txStatusSchema,
  handler: async (agent, input) => {
    try {
      const receipt = await agent.publicClient.getTransactionReceipt({
        hash: input.hash as `0x${string}`,
      });
      return ok("Tx status", {
        hash: input.hash,
        status: receipt.status,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
      });
    } catch (e) {
      return fail(`get_tx_status failed: ${errorMessage(e)}`);
    }
  },
};
