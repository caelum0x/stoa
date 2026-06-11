import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const signMessageSchema = z.object({
  message: z.string().min(1).describe("UTF-8 message to sign (EIP-191 personal_sign)."),
});

/// SKILL: sign_message — produce an EIP-191 signature over a message.
export const signMessageAction: Action<typeof signMessageSchema> = {
  name: "SIGN_MESSAGE",
  similes: ["sign message", "personal sign", "eip191 sign", "prove ownership"],
  description: "Sign a UTF-8 message with the agent's key (EIP-191). Returns the signature.",
  examples: [
    {
      input: { message: "gm" },
      output: ok("Signed", { signature: "0x..." }),
      explanation: "Signs an arbitrary message.",
    },
  ],
  schema: signMessageSchema,
  handler: async (agent, input) => {
    try {
      const signature = await agent.walletClient.signMessage({
        account: agent.account,
        message: input.message,
      });
      return ok("Signed", { message: input.message, signer: agent.address, signature });
    } catch (e) {
      return fail(`sign_message failed: ${errorMessage(e)}`);
    }
  },
};
