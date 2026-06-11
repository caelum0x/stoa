import { z } from "zod";
import { recoverMessageAddress } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const verifyMessageSchema = z.object({
  message: z.string().describe("The original UTF-8 message."),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, "Must be a 0x signature").describe("EIP-191 signature."),
  address: addressSchema.optional().describe("Expected signer. If provided, returns a match boolean."),
});

/// SKILL: verify_message — recover the signer of an EIP-191 signature.
export const verifyMessageAction: Action<typeof verifyMessageSchema> = {
  name: "VERIFY_MESSAGE",
  similes: ["verify signature", "recover signer", "who signed", "check signature"],
  description: "Recover the address that signed a message (EIP-191) and optionally compare it to an expected signer.",
  examples: [
    {
      input: { message: "gm", signature: "0x...", address: "0xabc" },
      output: ok("Recovered", { match: true }),
      explanation: "Verifies a signature against an address.",
    },
  ],
  schema: verifyMessageSchema,
  handler: async (_agent, input) => {
    try {
      const recovered = await recoverMessageAddress({
        message: input.message,
        signature: input.signature as `0x${string}`,
      });
      const match = input.address ? recovered.toLowerCase() === input.address.toLowerCase() : undefined;
      return ok("Recovered", { recovered, match });
    } catch (e) {
      return fail(`verify_message failed: ${errorMessage(e)}`);
    }
  },
};
