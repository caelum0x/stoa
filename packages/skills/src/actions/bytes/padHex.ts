import { z } from "zod";
import { pad, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const padHexSchema = z.object({
  hex: z.string().describe("0x-prefixed hex string to pad."),
  size: z.number().int().positive().default(32).describe("Target byte size. Defaults to 32."),
  dir: z
    .enum(["left", "right"])
    .optional()
    .describe('Pad direction: "left" (default) or "right".'),
});

/// SKILL: pad_hex — pad a hex string to a target byte size (left or right).
export const padHexAction: Action<typeof padHexSchema> = {
  name: "PAD_HEX",
  similes: ["pad hex", "zero pad", "pad bytes", "left pad hex"],
  description: "Pad a 0x-prefixed hex string with zero bytes to a target size, left or right.",
  examples: [
    {
      input: { hex: "0x1234", size: 4 },
      output: ok("Padded", { hex: "0x00001234" }),
      explanation: "Left-pads 0x1234 to 4 bytes.",
    },
  ],
  schema: padHexSchema,
  handler: async (_agent, input) => {
    try {
      const padded = pad(input.hex as Hex, { size: input.size, dir: input.dir });
      return ok("Padded", { input: input.hex, size: input.size, hex: padded });
    } catch (e) {
      return fail(`pad_hex failed: ${errorMessage(e)}`);
    }
  },
};
