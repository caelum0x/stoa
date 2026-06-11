import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const syncStatusSchema = z.object({});

/// Bigint-safe deep serialization for the eth_syncing result object.
const serialize = (x: unknown): unknown =>
  JSON.parse(JSON.stringify(x, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));

/// SKILL: sync_status — node sync state via eth_syncing.
export const syncStatusAction: Action<typeof syncStatusSchema> = {
  name: "SYNC_STATUS",
  similes: ["sync status", "is node syncing", "eth syncing", "node sync state"],
  description: "Return the Pharos node's sync status via eth_syncing: false when fully synced, or an object describing sync progress.",
  examples: [
    {
      input: {},
      output: ok("Sync status", { syncing: false, result: false }),
      explanation: "Node is fully synced, so eth_syncing returns false.",
    },
  ],
  schema: syncStatusSchema,
  handler: async (agent, _input) => {
    try {
      const result = await agent.publicClient.request({
        method: "eth_syncing",
        params: [],
      } as any);
      const serialized = serialize(result);
      return ok("Sync status", { syncing: serialized !== false, result: serialized });
    } catch (e) {
      return fail(`sync_status failed: ${errorMessage(e)}`);
    }
  },
};
