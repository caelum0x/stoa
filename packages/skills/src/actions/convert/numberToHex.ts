import { z } from "zod";
import { numberToHex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const numberToHexSchema = z.object({
  value: z.coerce.number().int().describe("Integer value to convert to hex."),
  size: z.coerce.number().int().positive().optional().describe("Optional byte size to pad the hex output to."),
});

/// SKILL: number_to_hex — convert an integer to a 0x-prefixed hex string.
export const numberToHexAction: Action<typeof numberToHexSchema> = {
  name: "NUMBER_TO_HEX",
  similes: ["number to hex", "encode hex", "int to hex", "to hex"],
  description: "Convert an integer to a 0x-prefixed hex string, optionally padded to a byte size.",
  examples: [
    {
      input: { value: 420 },
      output: ok("Hex", { hex: "0x1a4" }),
      explanation: "Converts 420 to the hex 0x1a4.",
    },
  ],
  schema: numberToHexSchema,
  handler: async (_agent, input) => {
    try {
      const hex = numberToHex(BigInt(input.value), input.size !== undefined ? { size: input.size } : undefined);
      return ok("Hex", { hex });
    } catch (e) {
      return fail(`number_to_hex failed: ${errorMessage(e)}`);
    }
  },
};
