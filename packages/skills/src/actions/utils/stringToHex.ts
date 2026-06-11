import { z } from "zod";
import { stringToHex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const stringToHexSchema = z.object({
  value: z.string().describe("UTF-8 string to encode as hex."),
});

/// SKILL: string_to_hex — encode a UTF-8 string as 0x hex.
export const stringToHexAction: Action<typeof stringToHexSchema> = {
  name: "STRING_TO_HEX",
  similes: ["string to hex", "utf8 to hex", "encode string", "text to hex"],
  description: "Encode a UTF-8 string into its 0x-prefixed hex representation.",
  examples: [
    {
      input: { value: "hello" },
      output: ok("Hex", { hex: "0x68656c6c6f" }),
      explanation: "Encodes 'hello' to hex.",
    },
  ],
  schema: stringToHexSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Hex", { hex: stringToHex(input.value) });
    } catch (e) {
      return fail(`string_to_hex failed: ${errorMessage(e)}`);
    }
  },
};
