import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const formatCountdownSchema = z.object({
  seconds: z.coerce.number().int().nonnegative().describe("Non-negative integer number of seconds."),
});

const pad = (n: number): string => String(n).padStart(2, "0");

/// SKILL: format_countdown — render seconds as a zero-padded "HH:MM:SS" clock.
export const formatCountdownAction: Action<typeof formatCountdownSchema> = {
  name: "FORMAT_COUNTDOWN",
  similes: ["format countdown", "seconds to clock", "hh mm ss", "countdown timer"],
  description: "Format a seconds count as a zero-padded \"HH:MM:SS\" string. Hours may exceed 99. No network access.",
  examples: [
    {
      input: { seconds: 3661 },
      output: ok("Countdown", { text: "01:01:01" }),
      explanation: "3661 seconds is 1 hour, 1 minute, 1 second.",
    },
  ],
  schema: formatCountdownSchema,
  handler: async (_agent, input) => {
    try {
      const total = input.seconds;
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const secs = total % 60;
      const text = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
      return ok("Countdown", { seconds: total, text });
    } catch (e) {
      return fail(`format_countdown failed: ${errorMessage(e)}`);
    }
  },
};
