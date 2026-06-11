import { z } from "zod";
import { isAddressEqual } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const addressEqualSchema = z.object({
  a: addressSchema.describe("First address."),
  b: addressSchema.describe("Second address."),
});

/// SKILL: address_equal — compare two addresses for equality (case-insensitive).
export const addressEqualAction: Action<typeof addressEqualSchema> = {
  name: "ADDRESS_EQUAL",
  similes: ["compare addresses", "addresses equal", "same address", "address match"],
  description: "Return whether two EVM addresses are equal, ignoring checksum casing.",
  examples: [
    {
      input: {
        a: "0x0000000000000000000000000000000000000001",
        b: "0x0000000000000000000000000000000000000001",
      },
      output: ok("Address equality", { equal: true }),
      explanation: "Compares two identical addresses.",
    },
  ],
  schema: addressEqualSchema,
  handler: async (_agent, input) => {
    try {
      const equal = isAddressEqual(input.a, input.b);
      return ok("Address equality", { a: input.a, b: input.b, equal });
    } catch (e) {
      return fail(`address_equal failed: ${errorMessage(e)}`);
    }
  },
};
