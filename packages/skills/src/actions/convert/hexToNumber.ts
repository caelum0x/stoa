import { z } from "zod";
import { hexToNumber, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const hexToNumberSchema = z.object({
  hex: z.string().describe("0x-prefixed hex value to convert to a number."),
});

/// SKILL: hex_to_number — convert a hex string to a JavaScript number.
export const hexToNumberAction: Action<typeof hexToNumberSchema> = {
  name: "HEX_TO_NUMBER",
  similes: ["hex to number", "parse hex", "hex to int", "decode hex"],
  description: "Convert a 0x-prefixed hex string to a decimal number.",
  examples: [
    {
      input: { hex: "0x1a4" },
      output: ok("Number", { value: 420 }),
      explanation: "Converts the hex 0x1a4 to 420.",
    },
  ],
  schema: hexToNumberSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Number", { value: hexToNumber(input.hex as Hex) });
    } catch (e) {
      return fail(`hex_to_number failed: ${errorMessage(e)}`);
    }
  },
};
