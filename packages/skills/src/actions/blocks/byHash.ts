import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const getBlockByHashSchema = z.object({
  hash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Must be a 0x-prefixed 32-byte block hash")
    .transform((v) => v as `0x${string}`)
    .describe("Block hash to look up."),
});

/// SKILL: get_block_by_hash — summary of a block identified by its hash.
export const getBlockByHashAction: Action<typeof getBlockByHashSchema> = {
  name: "GET_BLOCK_BY_HASH",
  similes: ["block by hash", "get block hash", "lookup block hash"],
  description: "Return a summary of a Pharos block identified by its hash: number, timestamp, and transaction count.",
  examples: [
    {
      input: { hash: "0x" + "0".repeat(64) },
      output: ok("Block", { number: "123", timestamp: 1700000000, txCount: 2 }),
      explanation: "Reads a block by its hash.",
    },
  ],
  schema: getBlockByHashSchema,
  handler: async (agent, input) => {
    try {
      const block = await agent.publicClient.getBlock({ blockHash: input.hash });
      return ok("Block", {
        number: block.number?.toString() ?? null,
        timestamp: Number(block.timestamp),
        txCount: block.transactions.length,
      });
    } catch (e) {
      return fail(`get_block_by_hash failed: ${errorMessage(e)}`);
    }
  },
};
