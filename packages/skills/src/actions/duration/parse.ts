import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const parseDurationSchema = z.object({
  text: z.string().describe('Duration like "1h30m", "2d", or "45s". Units: d/h/m/s.'),
});

const UNIT_SECONDS: Record<string, number> = { d: 86400, h: 3600, m: 60, s: 1 };

/// SKILL: parse_duration — parse a "1h30m" style string into total seconds.
export const parseDurationAction: Action<typeof parseDurationSchema> = {
  name: "PARSE_DURATION",
  similes: ["parse duration", "duration to seconds", "how many seconds", "convert duration"],
  description: "Parse a compact duration string (d/h/m/s units) into total seconds. No network access.",
  examples: [
    {
      input: { text: "1h30m" },
      output: ok("Parsed duration", { seconds: 5400 }),
      explanation: "1 hour 30 minutes equals 5400 seconds.",
    },
  ],
  schema: parseDurationSchema,
  handler: async (_agent, input) => {
    try {
      const normalized = input.text.trim().toLowerCase();
      const matches = normalized.match(/\d+\s*[dhms]/g);
      if (!matches || matches.join("").replace(/\s+/g, "").length !== normalized.replace(/\s+/g, "").length) {
        return fail(`parse_duration failed: invalid duration "${input.text}"`);
      }
      let seconds = 0;
      for (const part of matches) {
        const unit = part.trim().slice(-1);
        const value = Number(part.trim().slice(0, -1));
        seconds += value * (UNIT_SECONDS[unit] ?? 0);
      }
      return ok("Parsed duration", { text: input.text, seconds });
    } catch (e) {
      return fail(`parse_duration failed: ${errorMessage(e)}`);
    }
  },
};
