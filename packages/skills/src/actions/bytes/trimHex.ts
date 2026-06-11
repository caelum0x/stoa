import { z } from "zod";
import { trim, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const trimHexSchema = z.object({
  hex: z.string().describe("0x-prefixed hex string to trim of leading zero bytes."),
});

/// SKILL: trim_hex — strip leading zero bytes from a 0x-prefixed hex string.
export const trimHexAction: Action<typeof trimHexSchema> = {
  name: "TRIM_HEX",
  similes: ["trim hex", "strip zeros", "remove leading zeros", "trim bytes"],
  description: "Strip leading zero bytes from a 0x-prefixed hex string.",
  examples: [
    {
      input: { hex: "0x00001234" },
      output: ok("Trimmed", { hex: "0x1234" }),
      explanation: "Removes leading zero bytes from 0x00001234.",
    },
  ],
  schema: trimHexSchema,
  handler: async (_agent, input) => {
    try {
      const trimmed = trim(input.hex as Hex);
      return ok("Trimmed", { input: input.hex, hex: trimmed });
    } catch (e) {
      return fail(`trim_hex failed: ${errorMessage(e)}`);
    }
  },
};
