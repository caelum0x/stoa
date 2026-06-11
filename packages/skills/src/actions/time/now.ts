import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const unixNowSchema = z.object({});

/// SKILL: unix_now — current wall-clock time as a UNIX timestamp (seconds).
export const unixNowAction: Action<typeof unixNowSchema> = {
  name: "UNIX_NOW",
  similes: ["current time", "unix time", "now", "epoch seconds", "current timestamp"],
  description: "Return the current local wall-clock time as a UNIX timestamp in seconds.",
  examples: [
    { input: {}, output: ok("Current time", { unix: 1718000000 }), explanation: "Reads the local clock." },
  ],
  schema: unixNowSchema,
  handler: async (_agent) => {
    try {
      const unix = Math.floor(Date.now() / 1000);
      return ok("Current time", { unix });
    } catch (e) {
      return fail(`unix_now failed: ${errorMessage(e)}`);
    }
  },
};
