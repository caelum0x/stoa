import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const getBlockSchema = z.object({
  blockNumber: z.coerce.number().int().nonnegative().optional().describe("Block number; latest if omitted."),
});

/// SKILL: get_block — summary of a block (timestamp, txs, gas).
export const getBlockAction: Action<typeof getBlockSchema> = {
  name: "GET_BLOCK",
  similes: ["block details", "get block", "block info"],
  description: "Return a summary of a Pharos block: timestamp, transaction count, gas used/limit.",
  examples: [
    { input: {}, output: ok("Block", { number: "123" }), explanation: "Reads the latest block." },
  ],
  schema: getBlockSchema,
  handler: async (agent, input) => {
    try {
      const block =
        input.blockNumber === undefined
          ? await agent.publicClient.getBlock()
          : await agent.publicClient.getBlock({ blockNumber: BigInt(input.blockNumber) });
      return ok("Block", {
        number: block.number?.toString() ?? null,
        hash: block.hash,
        timestamp: Number(block.timestamp),
        txCount: block.transactions.length,
        gasUsed: block.gasUsed.toString(),
        gasLimit: block.gasLimit.toString(),
      });
    } catch (e) {
      return fail(`get_block failed: ${errorMessage(e)}`);
    }
  },
};
