import { z } from "zod";
import { hexToString, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const hexToStringSchema = z.object({
  hex: z.string().regex(/^0x[0-9a-fA-F]*$/, "Must be a 0x-prefixed hex string").describe("Hex value to decode into UTF-8."),
});

/// SKILL: hex_to_string — decode 0x hex into a UTF-8 string.
export const hexToStringAction: Action<typeof hexToStringSchema> = {
  name: "HEX_TO_STRING",
  similes: ["hex to string", "decode hex string", "hex to utf8", "hex to text"],
  description: "Decode a 0x-prefixed hex value into its UTF-8 string representation.",
  examples: [
    {
      input: { hex: "0x68656c6c6f" },
      output: ok("Decoded", { value: "hello" }),
      explanation: "Decodes hex back to 'hello'.",
    },
  ],
  schema: hexToStringSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Decoded", { value: hexToString(input.hex as Hex) });
    } catch (e) {
      return fail(`hex_to_string failed: ${errorMessage(e)}`);
    }
  },
};
