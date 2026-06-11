import { z } from "zod";
import { hashMessage } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const hashMessageSchema = z.object({
  message: z.string().describe("Plain string message to hash (EIP-191)."),
});

/// SKILL: hash_message — compute the EIP-191 hash of a plain string message.
export const hashMessageAction: Action<typeof hashMessageSchema> = {
  name: "HASH_MESSAGE",
  similes: ["eip191 hash", "hash message", "personal sign hash", "message digest"],
  description: "Compute the EIP-191 personal-sign hash of a plain string message.",
  examples: [
    {
      input: { message: "hello world" },
      output: ok("Message hashed", { hash: "0x..." }),
      explanation: "Hashes the message with the EIP-191 prefix.",
    },
  ],
  schema: hashMessageSchema,
  handler: async (_agent, input) => {
    try {
      const hash = hashMessage(input.message);
      return ok("Message hashed", { hash });
    } catch (e) {
      return fail(`hash_message failed: ${errorMessage(e)}`);
    }
  },
};
