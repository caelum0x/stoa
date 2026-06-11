import { z } from "zod";
import { boolToHex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const boolToHexSchema = z.object({
  value: z.boolean().describe("Boolean value to convert to hex."),
});

/// SKILL: bool_to_hex — convert a boolean to a 0x-prefixed hex string.
export const boolToHexAction: Action<typeof boolToHexSchema> = {
  name: "BOOL_TO_HEX",
  similes: ["bool to hex", "boolean to hex", "encode bool", "true false to hex"],
  description: "Convert a boolean to a 0x-prefixed hex string (0x1 for true, 0x0 for false).",
  examples: [
    {
      input: { value: true },
      output: ok("Hex", { hex: "0x1" }),
      explanation: "Converts true to the hex 0x1.",
    },
  ],
  schema: boolToHexSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Hex", { hex: boolToHex(input.value) });
    } catch (e) {
      return fail(`bool_to_hex failed: ${errorMessage(e)}`);
    }
  },
};
