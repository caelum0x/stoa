import { z } from "zod";
import { toHex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const toHexSchema = z.object({
  value: z.string().describe("Value to encode as hex. Numeric decimal strings become bigint, otherwise encoded as a UTF-8 string."),
});

/// SKILL: to_hex — encode a numeric or string value to 0x hex.
export const toHexAction: Action<typeof toHexSchema> = {
  name: "TO_HEX",
  similes: ["encode hex", "to hex", "number to hex", "string to hex value"],
  description: "Encode a value to 0x-prefixed hex. Decimal-integer strings encode as bigint, everything else as a UTF-8 string.",
  examples: [
    {
      input: { value: "420" },
      output: ok("Hex", { hex: "0x1a4" }),
      explanation: "Encodes the integer 420.",
    },
  ],
  schema: toHexSchema,
  handler: async (_agent, input) => {
    try {
      const isNumeric = /^\d+$/.test(input.value);
      const hex = isNumeric ? toHex(BigInt(input.value)) : toHex(input.value);
      return ok("Hex", { hex });
    } catch (e) {
      return fail(`to_hex failed: ${errorMessage(e)}`);
    }
  },
};
