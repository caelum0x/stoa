import { z } from "zod";
import { slice, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const sliceHexSchema = z.object({
  hex: z.string().describe("0x-prefixed hex string to slice."),
  start: z.number().int().min(0).describe("Start byte offset (inclusive)."),
  end: z.number().int().min(0).optional().describe("End byte offset (exclusive). Optional."),
});

/// SKILL: slice_hex — extract a byte range from a 0x-prefixed hex string.
export const sliceHexAction: Action<typeof sliceHexSchema> = {
  name: "SLICE_HEX",
  similes: ["slice hex", "substring bytes", "extract bytes", "hex slice"],
  description: "Extract a byte range [start, end) from a 0x-prefixed hex string.",
  examples: [
    {
      input: { hex: "0x12345678", start: 1, end: 3 },
      output: ok("Sliced", { hex: "0x3456" }),
      explanation: "Slices bytes 1 through 3 from 0x12345678.",
    },
  ],
  schema: sliceHexSchema,
  handler: async (_agent, input) => {
    try {
      const sliced = slice(input.hex as Hex, input.start, input.end);
      return ok("Sliced", { input: input.hex, start: input.start, end: input.end ?? null, hex: sliced });
    } catch (e) {
      return fail(`slice_hex failed: ${errorMessage(e)}`);
    }
  },
};
