import { z } from "zod";
import { isHex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const isHexSchema = z.object({
  value: z.string().describe("String to test for 0x-prefixed hex encoding."),
});

/// SKILL: validate_is_hex — check whether a string is valid 0x-prefixed hex.
export const isHexAction: Action<typeof isHexSchema> = {
  name: "VALIDATE_IS_HEX",
  similes: ["is hex", "valid hex", "check hex string", "hex validator"],
  description: "Pure validator: returns whether the given value is a valid 0x-prefixed hex string.",
  examples: [
    {
      input: { value: "0x1234" },
      output: ok("Validated", { valid: true }),
      explanation: "0x1234 is valid hex.",
    },
  ],
  schema: isHexSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Validated", { value: input.value, valid: isHex(input.value) });
    } catch (e) {
      return fail(`validate_is_hex failed: ${errorMessage(e)}`);
    }
  },
};
