import { z } from "zod";
import { bytesToHex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const bytesToHexSchema = z.object({
  bytes: z
    .array(z.number().int().min(0).max(255))
    .describe("Array of byte values (0-255) to encode as hex."),
});

/// SKILL: bytes_to_hex — encode an array of byte values into a 0x-prefixed hex string.
export const bytesToHexAction: Action<typeof bytesToHexSchema> = {
  name: "BYTES_TO_HEX",
  similes: ["bytes to hex", "encode bytes", "byte array to hex", "to hex string"],
  description: "Encode an array of byte values (0-255) into a 0x-prefixed hex string.",
  examples: [
    {
      input: { bytes: [72, 101, 108, 108, 111] },
      output: ok("Hex", { hex: "0x48656c6c6f" }),
      explanation: "Encodes the bytes for 'Hello' into hex.",
    },
  ],
  schema: bytesToHexSchema,
  handler: async (_agent, input) => {
    try {
      const hex = bytesToHex(Uint8Array.from(input.bytes));
      return ok("Hex", { bytes: input.bytes, hex });
    } catch (e) {
      return fail(`bytes_to_hex failed: ${errorMessage(e)}`);
    }
  },
};
