import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const jsonSafe = (x: unknown): unknown =>
  JSON.parse(JSON.stringify(x, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));

export const eventsGetLogsSchema = z.object({
  address: addressSchema.optional().describe("Contract address to filter logs by."),
  fromBlock: z.coerce.number().int().nonnegative().optional().describe("Start block (inclusive)."),
  toBlock: z.coerce.number().int().nonnegative().optional().describe("End block (inclusive)."),
});

/// SKILL: events_get_logs — fetch raw event logs in a block range, bigint-safe.
export const eventsGetLogsAction: Action<typeof eventsGetLogsSchema> = {
  name: "EVENTS_GET_LOGS",
  similes: ["get logs", "fetch logs", "query events", "read event logs"],
  description: "Fetch raw event logs on Pharos, optionally filtered by contract address and block range.",
  examples: [
    {
      input: { address: "0xabc", fromBlock: 100, toBlock: 200 },
      output: ok("Logs fetched", { count: 1, logs: [] }),
      explanation: "Reads logs emitted by a contract between blocks 100 and 200.",
    },
  ],
  schema: eventsGetLogsSchema,
  handler: async (agent, input) => {
    try {
      const logs = await agent.publicClient.getLogs({
        ...(input.address ? { address: input.address } : {}),
        ...(input.fromBlock !== undefined ? { fromBlock: BigInt(input.fromBlock) } : {}),
        ...(input.toBlock !== undefined ? { toBlock: BigInt(input.toBlock) } : {}),
      });
      const limited = logs.slice(0, 50);
      return ok("Logs fetched", {
        count: logs.length,
        returned: limited.length,
        logs: jsonSafe(limited),
      });
    } catch (e) {
      return fail(`events_get_logs failed: ${errorMessage(e)}`);
    }
  },
};
