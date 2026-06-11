import { z } from "zod";
import { zeroAddress } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const isZeroAddressSchema = z.object({
  address: addressSchema.describe("Address to check against the zero address."),
});

/// SKILL: is_zero_address — check whether an address is the zero address.
export const isZeroAddressAction: Action<typeof isZeroAddressSchema> = {
  name: "IS_ZERO_ADDRESS",
  similes: ["zero address", "is null address", "is empty address", "0x0 check"],
  description: "Return whether the given address equals the EVM zero address (0x0000...0000).",
  examples: [
    {
      input: { address: "0x0000000000000000000000000000000000000000" },
      output: ok("Zero address check", { isZero: true }),
      explanation: "Confirms the zero address.",
    },
  ],
  schema: isZeroAddressSchema,
  handler: async (_agent, input) => {
    try {
      const isZero = input.address.toLowerCase() === zeroAddress;
      return ok("Zero address check", { address: input.address, isZero });
    } catch (e) {
      return fail(`is_zero_address failed: ${errorMessage(e)}`);
    }
  },
};
