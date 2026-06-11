import { z } from "zod";
import { hexToBigInt, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const hexToBigIntSchema = z.object({
  hex: z.string().describe("0x-prefixed hex value to convert to a big integer."),
});

/// SKILL: hex_to_bigint — convert a hex string to a big integer (as a decimal string).
export const hexToBigIntAction: Action<typeof hexToBigIntSchema> = {
  name: "HEX_TO_BIGINT",
  similes: ["hex to bigint", "hex to uint256", "parse hex bigint", "decode hex bigint"],
  description: "Convert a 0x-prefixed hex string to a big integer, returned as a decimal string.",
  examples: [
    {
      input: { hex: "0xde0b6b3a7640000" },
      output: ok("BigInt", { value: "1000000000000000000" }),
      explanation: "Converts the hex value to its decimal string 1e18.",
    },
  ],
  schema: hexToBigIntSchema,
  handler: async (_agent, input) => {
    try {
      return ok("BigInt", { value: hexToBigInt(input.hex as Hex).toString() });
    } catch (e) {
      return fail(`hex_to_bigint failed: ${errorMessage(e)}`);
    }
  },
};
