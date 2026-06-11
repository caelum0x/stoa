import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const extractEventsSchema = z.object({
  abi: z.string().describe("A JSON-stringified ABI array to extract events from."),
});

interface AbiNamed {
  type?: string;
  name?: string;
}

/// SKILL: extract_events — list event names from a JSON ABI.
export const extractEventsAction: Action<typeof extractEventsSchema> = {
  name: "EXTRACT_EVENTS",
  similes: ["extract events", "list events", "abi events", "event names"],
  description: "List all event names contained in a JSON ABI.",
  examples: [
    {
      input: { abi: "[{\"type\":\"event\",\"name\":\"Transfer\",\"inputs\":[]}]" },
      output: ok("Events", { names: ["Transfer"] }),
      explanation: "Extracts event names from the ABI.",
    },
  ],
  schema: extractEventsSchema,
  handler: async (_agent, input) => {
    try {
      const parsed = JSON.parse(input.abi) as AbiNamed[];
      const names = parsed.filter((item) => item.type === "event").map((item) => item.name ?? "");
      return ok("Events", { names });
    } catch (e) {
      return fail(`extract_events failed: ${errorMessage(e)}`);
    }
  },
};
