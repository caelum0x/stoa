import { z } from "zod";
import { hexToBytes, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const hexToBytesSchema = z.object({
  hex: z.string().describe("0x-prefixed hex string to decode into bytes."),
});

/// SKILL: hex_to_bytes — decode a 0x-prefixed hex string into a byte array.
export const hexToBytesAction: Action<typeof hexToBytesSchema> = {
  name: "HEX_TO_BYTES",
  similes: ["hex to bytes", "decode hex", "hex to byte array", "parse hex bytes"],
  description: "Decode a 0x-prefixed hex string into an array of byte values (0-255).",
  examples: [
    {
      input: { hex: "0x48656c6c6f" },
      output: ok("Bytes", { bytes: [72, 101, 108, 108, 111] }),
      explanation: "Decodes the hex for 'Hello' into its byte values.",
    },
  ],
  schema: hexToBytesSchema,
  handler: async (_agent, input) => {
    try {
      const bytes = Array.from(hexToBytes(input.hex as Hex));
      return ok("Bytes", { hex: input.hex, bytes });
    } catch (e) {
      return fail(`hex_to_bytes failed: ${errorMessage(e)}`);
    }
  },
};
