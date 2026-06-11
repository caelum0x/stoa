import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const humanizeSecondsSchema = z.object({
  seconds: z.coerce.number().int().nonnegative().describe("Non-negative integer number of seconds."),
});

/// SKILL: humanize_seconds — render seconds as "1d 2h 3m 4s", trimming zero units.
export const humanizeSecondsAction: Action<typeof humanizeSecondsSchema> = {
  name: "HUMANIZE_SECONDS",
  similes: ["humanize seconds", "format duration", "seconds to text", "readable duration"],
  description: "Convert a seconds count into a human-readable \"1d 2h 3m 4s\" string, omitting zero units. No network access.",
  examples: [
    {
      input: { seconds: 93784 },
      output: ok("Humanized duration", { text: "1d 2h 3m 4s" }),
      explanation: "93784 seconds is 1 day, 2 hours, 3 minutes, 4 seconds.",
    },
  ],
  schema: humanizeSecondsSchema,
  handler: async (_agent, input) => {
    try {
      const total = input.seconds;
      const days = Math.floor(total / 86400);
      const hours = Math.floor((total % 86400) / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const secs = total % 60;
      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (secs > 0) parts.push(`${secs}s`);
      const text = parts.length > 0 ? parts.join(" ") : "0s";
      return ok("Humanized duration", { seconds: total, text });
    } catch (e) {
      return fail(`humanize_seconds failed: ${errorMessage(e)}`);
    }
  },
};
