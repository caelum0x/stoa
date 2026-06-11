import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const chainTimeSchema = z.object({});

/// SKILL: chain_time — timestamp of the latest block on Pharos (UNIX seconds).
export const chainTimeAction: Action<typeof chainTimeSchema> = {
  name: "CHAIN_TIME",
  similes: ["chain time", "block timestamp", "latest block time", "on-chain clock", "network time"],
  description: "Return the timestamp of the latest block on the connected Pharos network as a UNIX timestamp in seconds.",
  examples: [
    { input: {}, output: ok("Chain time", { unix: 1718000000 }), explanation: "Reads the latest block timestamp." },
  ],
  schema: chainTimeSchema,
  handler: async (agent) => {
    try {
      const block = await agent.publicClient.getBlock();
      return ok("Chain time", { unix: Number(block.timestamp) });
    } catch (e) {
      return fail(`chain_time failed: ${errorMessage(e)}`);
    }
  },
};
