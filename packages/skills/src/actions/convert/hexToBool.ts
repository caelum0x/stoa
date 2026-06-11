import { z } from "zod";
import { hexToBool, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const hexToBoolSchema = z.object({
  hex: z.string().describe("0x-prefixed hex value to convert to a boolean."),
});

/// SKILL: hex_to_bool — convert a hex string to a boolean.
export const hexToBoolAction: Action<typeof hexToBoolSchema> = {
  name: "HEX_TO_BOOL",
  similes: ["hex to bool", "hex to boolean", "decode bool", "parse hex bool"],
  description: "Convert a 0x-prefixed hex string to a boolean (0x1 is true, 0x0 is false).",
  examples: [
    {
      input: { hex: "0x1" },
      output: ok("Boolean", { value: true }),
      explanation: "Converts the hex 0x1 to true.",
    },
  ],
  schema: hexToBoolSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Boolean", { value: hexToBool(input.hex as Hex) });
    } catch (e) {
      return fail(`hex_to_bool failed: ${errorMessage(e)}`);
    }
  },
};
