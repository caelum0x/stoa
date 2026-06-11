import { z } from "zod";
import { size, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const sizeOfSchema = z.object({
  hex: z.string().describe("0x-prefixed hex string to measure."),
});

/// SKILL: size_of — return the byte length of a 0x-prefixed hex string.
export const sizeOfAction: Action<typeof sizeOfSchema> = {
  name: "SIZE_OF",
  similes: ["size of hex", "byte length", "hex length", "how many bytes"],
  description: "Return the length in bytes of a 0x-prefixed hex string.",
  examples: [
    {
      input: { hex: "0x12345678" },
      output: ok("Size", { size: 4 }),
      explanation: "Reports that 0x12345678 is 4 bytes long.",
    },
  ],
  schema: sizeOfSchema,
  handler: async (_agent, input) => {
    try {
      const bytes = size(input.hex as Hex);
      return ok("Size", { hex: input.hex, size: bytes });
    } catch (e) {
      return fail(`size_of failed: ${errorMessage(e)}`);
    }
  },
};
