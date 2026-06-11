import { z } from "zod";
import { getAddress } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const isChecksumSchema = z.object({
  value: z.string().describe("Address string to test for EIP-55 checksum correctness."),
});

/// SKILL: validate_is_checksum — check whether an address is correctly EIP-55 checksummed.
export const isChecksumAction: Action<typeof isChecksumSchema> = {
  name: "VALIDATE_IS_CHECKSUM",
  similes: ["is checksum", "valid checksum", "eip55", "checksum validator"],
  description: "Pure validator: returns whether the given address is a correctly EIP-55 checksummed address.",
  examples: [
    {
      input: { value: "0x52908400098527886E0F7030069857D2E4169EE7" },
      output: ok("Validated", { valid: true }),
      explanation: "An EIP-55 checksummed address validates true.",
    },
  ],
  schema: isChecksumSchema,
  handler: async (_agent, input) => {
    try {
      let valid: boolean;
      try {
        valid = getAddress(input.value) === input.value;
      } catch {
        valid = false;
      }
      return ok("Validated", { value: input.value, valid });
    } catch (e) {
      return fail(`validate_is_checksum failed: ${errorMessage(e)}`);
    }
  },
};
