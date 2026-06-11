import { z } from "zod";
import { type Abi } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const jsonSafe = (x: unknown): unknown =>
  JSON.parse(JSON.stringify(x, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));

export const eventsByContractSchema = z.object({
  address: addressSchema.describe("Contract address to read events from."),
  abi: z.string().describe("Contract ABI as a JSON string."),
  eventName: z.string().describe("Name of the event to query."),
  fromBlock: z.coerce.number().int().nonnegative().optional().describe("Start block (inclusive)."),
});

/// SKILL: events_by_contract — fetch decoded events of a named type from a contract.
export const eventsByContractAction: Action<typeof eventsByContractSchema> = {
  name: "EVENTS_BY_CONTRACT",
  similes: ["contract events", "events by name", "read contract events", "query contract logs"],
  description: "Fetch and decode events of a given name emitted by a contract on Pharos.",
  examples: [
    {
      input: { address: "0xabc", abi: "[]", eventName: "Transfer", fromBlock: 100 },
      output: ok("Contract events fetched", { count: 1, events: [] }),
      explanation: "Reads Transfer events from a contract since block 100.",
    },
  ],
  schema: eventsByContractSchema,
  handler: async (agent, input) => {
    try {
      const abi = JSON.parse(input.abi) as Abi;
      const events = await agent.publicClient.getContractEvents({
        address: input.address,
        abi,
        eventName: input.eventName,
        ...(input.fromBlock !== undefined ? { fromBlock: BigInt(input.fromBlock) } : {}),
      });
      const limited = events.slice(0, 50);
      return ok("Contract events fetched", {
        address: input.address,
        eventName: input.eventName,
        count: events.length,
        returned: limited.length,
        events: jsonSafe(limited),
      });
    } catch (e) {
      return fail(`events_by_contract failed: ${errorMessage(e)}`);
    }
  },
};
