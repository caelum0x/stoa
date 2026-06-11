import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const latestBlocksSchema = z.object({
  count: z.coerce
    .number()
    .int()
    .positive()
    .max(20)
    .optional()
    .default(5)
    .describe("How many recent blocks to return (1-20, default 5)."),
});

interface BlockSummary {
  number: string | null;
  timestamp: number;
  txCount: number;
}

/// SKILL: latest_blocks — summaries of the most recent N blocks.
export const latestBlocksAction: Action<typeof latestBlocksSchema> = {
  name: "LATEST_BLOCKS",
  similes: ["recent blocks", "last blocks", "newest blocks", "head blocks"],
  description: "Return summaries (number, timestamp, transaction count) of the most recent N Pharos blocks.",
  examples: [
    {
      input: { count: 2 },
      output: ok("Latest blocks", { blocks: [{ number: "124", timestamp: 1700000001, txCount: 1 }] }),
      explanation: "Reads the two most recent blocks.",
    },
  ],
  schema: latestBlocksSchema,
  handler: async (agent, input) => {
    try {
      const head = await agent.publicClient.getBlockNumber();
      const count = BigInt(input.count);
      const start = head >= count ? head - count + 1n : 0n;
      const blocks: BlockSummary[] = [];
      for (let n = start; n <= head; n++) {
        const block = await agent.publicClient.getBlock({ blockNumber: n });
        blocks.push({
          number: block.number?.toString() ?? null,
          timestamp: Number(block.timestamp),
          txCount: block.transactions.length,
        });
      }
      return ok("Latest blocks", { blocks });
    } catch (e) {
      return fail(`latest_blocks failed: ${errorMessage(e)}`);
    }
  },
};
