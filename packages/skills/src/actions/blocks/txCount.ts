import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const blockTxCountSchema = z.object({
  blockNumber: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Block number; latest if omitted."),
});

/// SKILL: block_tx_count — number of transactions in a block.
export const blockTxCountAction: Action<typeof blockTxCountSchema> = {
  name: "BLOCK_TX_COUNT",
  similes: ["block transaction count", "txs in block", "how many transactions"],
  description: "Return the number of transactions in a Pharos block, by number or the latest block.",
  examples: [
    {
      input: {},
      output: ok("Block transaction count", { count: 3 }),
      explanation: "Counts transactions in the latest block.",
    },
  ],
  schema: blockTxCountSchema,
  handler: async (agent, input) => {
    try {
      const count =
        input.blockNumber === undefined
          ? await agent.publicClient.getBlockTransactionCount()
          : await agent.publicClient.getBlockTransactionCount({
              blockNumber: BigInt(input.blockNumber),
            });
      return ok("Block transaction count", { count });
    } catch (e) {
      return fail(`block_tx_count failed: ${errorMessage(e)}`);
    }
  },
};
