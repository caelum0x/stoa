import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const secondsUntilSchema = z.object({
  unix: z.number().int().describe("Target UNIX timestamp in seconds."),
});

/// SKILL: seconds_until — seconds from now until a target UNIX timestamp (negative if past).
export const secondsUntilAction: Action<typeof secondsUntilSchema> = {
  name: "SECONDS_UNTIL",
  similes: ["seconds until", "time remaining", "countdown", "how long until", "seconds left"],
  description: "Return the number of seconds from now until a target UNIX timestamp. Negative if the target is in the past.",
  examples: [
    {
      input: { unix: 1718000600 },
      output: ok("Seconds until target", { seconds: 600 }),
      explanation: "Difference between the target and the local clock.",
    },
  ],
  schema: secondsUntilSchema,
  handler: async (_agent, input) => {
    try {
      const seconds = input.unix - Math.floor(Date.now() / 1000);
      return ok("Seconds until target", { unix: input.unix, seconds });
    } catch (e) {
      return fail(`seconds_until failed: ${errorMessage(e)}`);
    }
  },
};
