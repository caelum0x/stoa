import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const blockNumberSchema = z.object({});

/// SKILL: get_block_number — current head block height on Pharos.
export const blockNumberAction: Action<typeof blockNumberSchema> = {
  name: "GET_BLOCK_NUMBER",
  similes: ["block height", "current block", "latest block number", "chain head"],
  description: "Return the latest block number on the connected Pharos network.",
  examples: [
    { input: {}, output: ok("Block number", { blockNumber: "123456" }), explanation: "Reads chain head." },
  ],
  schema: blockNumberSchema,
  handler: async (agent) => {
    try {
      const bn = await agent.publicClient.getBlockNumber();
      return ok("Block number", { blockNumber: bn.toString() });
    } catch (e) {
      return fail(`get_block_number failed: ${errorMessage(e)}`);
    }
  },
};
