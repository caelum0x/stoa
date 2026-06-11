import { z } from "zod";
import { isAddress } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const isAddressSchema = z.object({
  value: z.string().describe("String to test as an EVM address."),
});

/// SKILL: validate_is_address — check whether a string is a valid EVM address.
export const isAddressAction: Action<typeof isAddressSchema> = {
  name: "VALIDATE_IS_ADDRESS",
  similes: ["is address", "valid address", "check address", "address validator"],
  description: "Pure validator: returns whether the given value is a valid EVM address per viem isAddress.",
  examples: [
    {
      input: { value: "0x0000000000000000000000000000000000000000" },
      output: ok("Validated", { valid: true }),
      explanation: "The zero address is a valid EVM address.",
    },
  ],
  schema: isAddressSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Validated", { value: input.value, valid: isAddress(input.value) });
    } catch (e) {
      return fail(`validate_is_address failed: ${errorMessage(e)}`);
    }
  },
};
