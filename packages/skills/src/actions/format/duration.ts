import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const formatDurationSchema = z.object({
  seconds: z.coerce.number().int().nonnegative().describe("Duration in whole seconds."),
});

/// SKILL: format_duration — render seconds as a human string like "1h 2m 3s".
export const formatDurationAction: Action<typeof formatDurationSchema> = {
  name: "FORMAT_DURATION",
  similes: ["format duration", "humanize seconds", "seconds to time", "pretty duration"],
  description: "Convert a whole-second duration into a compact human string such as \"1h 2m 3s\". Pure, no network access.",
  examples: [
    {
      input: { seconds: 3723 },
      output: ok("Formatted duration", { formatted: "1h 2m 3s" }),
      explanation: "Breaks 3723 seconds into hours, minutes, and seconds.",
    },
  ],
  schema: formatDurationSchema,
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
      if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
      return ok("Formatted duration", { seconds: total, formatted: parts.join(" ") });
    } catch (e) {
      return fail(`format_duration failed: ${errorMessage(e)}`);
    }
  },
};
