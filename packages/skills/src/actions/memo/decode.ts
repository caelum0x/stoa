import { z } from "zod";
import { hexToString, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const decodeMemoSchema = z.object({
  hex: z
    .string()
    .regex(/^0x[0-9a-fA-F]*$/, "Must be a 0x-prefixed hex string")
    .describe("0x-prefixed hex to decode back into a UTF-8 string."),
});

/// SKILL: decode_memo — decode 0x-prefixed hex calldata back into a UTF-8 string.
export const decodeMemoAction: Action<typeof decodeMemoSchema> = {
  name: "DECODE_MEMO",
  similes: ["decode memo", "hex to string", "calldata to text", "hex to memo"],
  description: "Decode 0x-prefixed hex (e.g. transaction calldata or an on-chain memo) back into a UTF-8 string.",
  examples: [
    {
      input: { hex: "0x676d" },
      output: ok("Decoded memo", { text: "gm" }),
      explanation: "Decodes the hex '0x676d' to the UTF-8 string 'gm'.",
    },
  ],
  schema: decodeMemoSchema,
  handler: async (_agent, input) => {
    try {
      const text = hexToString(input.hex as Hex);
      return ok("Decoded memo", { text });
    } catch (e) {
      return fail(`decode_memo failed: ${errorMessage(e)}`);
    }
  },
};
