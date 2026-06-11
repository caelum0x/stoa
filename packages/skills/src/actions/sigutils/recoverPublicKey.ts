import { z } from "zod";
import { recoverPublicKey, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const recoverPublicKeySchema = z.object({
  hash: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, "Must be a 0x-prefixed hash")
    .describe("0x-prefixed hash that was signed."),
  signature: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, "Must be a 0x-prefixed signature")
    .describe("0x-prefixed hex signature."),
});

/// SKILL: recover_public_key — recover the signing public key from a hash and signature.
export const recoverPublicKeyAction: Action<typeof recoverPublicKeySchema> = {
  name: "RECOVER_PUBLIC_KEY",
  similes: ["recover public key", "ecrecover pubkey", "signer public key", "recover pubkey"],
  description: "Recover the public key that produced a signature over a given hash.",
  examples: [
    {
      input: { hash: "0x" + "11".repeat(32), signature: "0x" + "ab".repeat(65) },
      output: ok("Public key", { publicKey: "0x..." }),
      explanation: "Recovers the public key from the hash and signature.",
    },
  ],
  schema: recoverPublicKeySchema,
  handler: async (_agent, input) => {
    try {
      const publicKey = await recoverPublicKey({
        hash: input.hash as Hex,
        signature: input.signature as Hex,
      });
      return ok("Public key", { publicKey });
    } catch (e) {
      return fail(`recover_public_key failed: ${errorMessage(e)}`);
    }
  },
};
