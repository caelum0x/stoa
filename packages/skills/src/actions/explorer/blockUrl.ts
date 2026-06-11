import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

const DEFAULT_EXPLORER = "https://atlantic.pharosscan.xyz";

export const explorerBlockUrlSchema = z.object({
  blockNumber: z
    .string()
    .regex(/^\d+$/, "Must be a non-negative integer block number string.")
    .describe("Block number to link to."),
});

/// SKILL: explorer_block_url — build a block explorer URL for a block.
export const explorerBlockUrlAction: Action<typeof explorerBlockUrlSchema> = {
  name: "EXPLORER_BLOCK_URL",
  similes: ["block link", "block explorer url", "view block", "scan block"],
  description: "Build the block explorer URL for a block number on the connected Pharos network.",
  examples: [
    {
      input: { blockNumber: "123456" },
      output: ok("Explorer URL", { url: "https://atlantic.pharosscan.xyz/block/123456" }),
      explanation: "Links to a block.",
    },
  ],
  schema: explorerBlockUrlSchema,
  handler: async (agent, input) => {
    try {
      const base = (agent.chain.blockExplorers?.default?.url ?? DEFAULT_EXPLORER).replace(/\/$/, "");
      const url = `${base}/block/${input.blockNumber}`;
      return ok("Explorer URL", { blockNumber: input.blockNumber, url });
    } catch (e) {
      return fail(`explorer_block_url failed: ${errorMessage(e)}`);
    }
  },
};
