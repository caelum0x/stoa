import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const formatTimestampSchema = z.object({
  seconds: z.coerce.number().int().nonnegative().describe("Unix timestamp in seconds."),
});

/// SKILL: format_timestamp — convert a Unix-second timestamp to an ISO 8601 string.
export const formatTimestampAction: Action<typeof formatTimestampSchema> = {
  name: "FORMAT_TIMESTAMP",
  similes: ["format timestamp", "unix to iso", "humanize timestamp", "timestamp to date"],
  description: "Convert a Unix timestamp in seconds to an ISO 8601 UTC date-time string. Pure, no network access.",
  examples: [
    {
      input: { seconds: 1700000000 },
      output: ok("Formatted timestamp", { iso: "2023-11-14T22:13:20.000Z" }),
      explanation: "Converts a Unix-second timestamp to ISO 8601.",
    },
  ],
  schema: formatTimestampSchema,
  handler: async (_agent, input) => {
    try {
      const iso = new Date(input.seconds * 1000).toISOString();
      return ok("Formatted timestamp", { seconds: input.seconds, iso });
    } catch (e) {
      return fail(`format_timestamp failed: ${errorMessage(e)}`);
    }
  },
};
