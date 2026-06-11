import { z } from "zod";
import { isAddress } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const isAddressSchema = z.object({
  value: z.string().describe("String to test for being a valid EVM address."),
});

/// SKILL: is_address — check whether a string is a valid EVM address.
export const isAddressAction: Action<typeof isAddressSchema> = {
  name: "IS_ADDRESS",
  similes: ["validate address", "is valid address", "check address", "address valid"],
  description: "Return whether the given string is a valid EVM (0x) address.",
  examples: [
    {
      input: { value: "0x0000000000000000000000000000000000000000" },
      output: ok("Address check", { isAddress: true }),
      explanation: "Validates an address string.",
    },
  ],
  schema: isAddressSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Address check", { value: input.value, isAddress: isAddress(input.value) });
    } catch (e) {
      return fail(`is_address failed: ${errorMessage(e)}`);
    }
  },
};
