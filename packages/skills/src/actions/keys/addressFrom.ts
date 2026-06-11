import { z } from "zod";
import { privateKeyToAccount } from "viem/accounts";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const keyAddressFromPrivateKeySchema = z.object({
  privateKey: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Must be a 0x-prefixed 32-byte private key")
    .transform((v) => v as `0x${string}`)
    .describe("0x-prefixed 32-byte private key."),
});

/// SKILL: key_address_from_private_key — derive the EVM address for a private key.
export const keyAddressFromPrivateKeyAction: Action<typeof keyAddressFromPrivateKeySchema> = {
  name: "KEY_ADDRESS_FROM_PRIVATE_KEY",
  similes: ["address from key", "derive address", "private key to address", "key owner"],
  description: "Derive the EVM address corresponding to a given private key.",
  examples: [
    {
      input: { privateKey: "0x..." },
      output: ok("Address derived", { address: "0x..." }),
      explanation: "Computes the address owned by the private key.",
    },
  ],
  schema: keyAddressFromPrivateKeySchema,
  handler: async (_agent, input) => {
    try {
      const address = privateKeyToAccount(input.privateKey).address;
      return ok("Address derived", { address });
    } catch (e) {
      return fail(`key_address_from_private_key failed: ${errorMessage(e)}`);
    }
  },
};
