import { z } from "zod";
import { parseEventLogs, type Abi, type Hash } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

const jsonSafe = (x: unknown): unknown =>
  JSON.parse(JSON.stringify(x, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));

export const eventsParseReceiptSchema = z.object({
  hash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Must be a 0x-prefixed 32-byte tx hash")
    .describe("Transaction hash to fetch and parse."),
  abi: z.string().describe("Contract ABI as a JSON string used to decode the logs."),
});

/// SKILL: events_parse_receipt — decode a transaction receipt's logs against an ABI.
export const eventsParseReceiptAction: Action<typeof eventsParseReceiptSchema> = {
  name: "EVENTS_PARSE_RECEIPT",
  similes: ["parse receipt", "decode logs", "parse tx events", "decode receipt"],
  description: "Fetch a transaction receipt on Pharos and decode its event logs using the provided ABI.",
  examples: [
    {
      input: { hash: "0xtx", abi: "[]" },
      output: ok("Receipt parsed", { count: 0, events: [] }),
      explanation: "Decodes the events emitted by a transaction.",
    },
  ],
  schema: eventsParseReceiptSchema,
  handler: async (agent, input) => {
    try {
      const abi = JSON.parse(input.abi) as Abi;
      const receipt = await agent.publicClient.getTransactionReceipt({ hash: input.hash as Hash });
      const events = parseEventLogs({ abi, logs: receipt.logs });
      return ok("Receipt parsed", {
        hash: input.hash,
        count: events.length,
        events: jsonSafe(events),
      });
    } catch (e) {
      return fail(`events_parse_receipt failed: ${errorMessage(e)}`);
    }
  },
};
