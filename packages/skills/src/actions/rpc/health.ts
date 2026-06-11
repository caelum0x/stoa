import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const rpcHealthSchema = z.object({});

/// SKILL: rpc_health — check connectivity and latency of the Pharos RPC endpoint.
export const rpcHealthAction: Action<typeof rpcHealthSchema> = {
  name: "RPC_HEALTH",
  similes: ["rpc health", "node status", "ping rpc", "is rpc up", "endpoint health"],
  description:
    "Check the configured Pharos RPC endpoint by timing a block-number request; returns reachability, latency, and the current block number.",
  examples: [
    {
      input: {},
      output: ok("RPC healthy", { ok: true, blockNumber: "123", rpcUrl: "https://..." }),
      explanation: "Confirms the node is reachable and reports the latest block.",
    },
  ],
  schema: rpcHealthSchema,
  handler: async (agent) => {
    try {
      const start = Date.now();
      const blockNumber = await agent.publicClient.getBlockNumber();
      const latencyMs = Date.now() - start;
      return ok("RPC healthy", {
        ok: true,
        blockNumber: blockNumber.toString(),
        latencyMs,
        rpcUrl: agent.rpcUrl,
      });
    } catch (e) {
      return fail(`rpc_health failed: ${errorMessage(e)}`);
    }
  },
};
