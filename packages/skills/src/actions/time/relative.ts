import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const formatRelativeSchema = z.object({
  unix: z.number().int().describe("Target UNIX timestamp in seconds."),
});

const UNITS: ReadonlyArray<readonly [string, number]> = [
  ["d", 86400],
  ["h", 3600],
  ["m", 60],
  ["s", 1],
];

const humanize = (deltaSeconds: number): string => {
  const abs = Math.abs(deltaSeconds);
  if (abs < 1) return "now";
  const unit = UNITS.find(([, size]) => abs >= size) ?? UNITS[UNITS.length - 1] ?? ["s", 1];
  const value = Math.floor(abs / unit[1]);
  const label = `${value}${unit[0]}`;
  return deltaSeconds >= 0 ? `in ${label}` : `${label} ago`;
};

/// SKILL: format_relative — render a UNIX timestamp as a human relative phrase (e.g. "in 3m", "5m ago").
export const formatRelativeAction: Action<typeof formatRelativeSchema> = {
  name: "FORMAT_RELATIVE",
  similes: ["relative time", "time ago", "humanize time", "format relative", "how long ago"],
  description: 'Format a target UNIX timestamp as a human relative phrase versus now, e.g. "in 3m" or "5m ago".',
  examples: [
    {
      input: { unix: 1718000180 },
      output: ok("Relative time", { relative: "in 3m" }),
      explanation: "Three minutes ahead of the local clock.",
    },
  ],
  schema: formatRelativeSchema,
  handler: async (_agent, input) => {
    try {
      const delta = input.unix - Math.floor(Date.now() / 1000);
      return ok("Relative time", { unix: input.unix, relative: humanize(delta) });
    } catch (e) {
      return fail(`format_relative failed: ${errorMessage(e)}`);
    }
  },
};
