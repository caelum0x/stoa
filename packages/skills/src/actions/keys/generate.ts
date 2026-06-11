import { z } from "zod";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const keyGeneratePrivateKeySchema = z.object({});

/// SKILL: key_generate_private_key — create a fresh keypair (TESTNET/dev only).
export const keyGeneratePrivateKeyAction: Action<typeof keyGeneratePrivateKeySchema> = {
  name: "KEY_GENERATE_PRIVATE_KEY",
  similes: ["new private key", "generate key", "create wallet key", "new keypair"],
  description:
    "Generate a fresh random private key and its derived address. " +
    "TESTNET/dev use only — never use a generated key to hold real funds.",
  examples: [
    {
      input: {},
      output: ok("Private key generated", { privateKey: "0x...", address: "0x..." }),
      explanation: "Creates a random keypair for dev/testnet.",
    },
  ],
  schema: keyGeneratePrivateKeySchema,
  handler: async (_agent) => {
    try {
      const privateKey = generatePrivateKey();
      const address = privateKeyToAccount(privateKey).address;
      return ok("Private key generated", { privateKey, address });
    } catch (e) {
      return fail(`key_generate_private_key failed: ${errorMessage(e)}`);
    }
  },
};
