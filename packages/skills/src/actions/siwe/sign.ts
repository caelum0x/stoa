import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const signAuthMessageSchema = z.object({
  message: z.string().min(1).describe("Plaintext auth message to sign (e.g. from BUILD_AUTH_MESSAGE)."),
});

/// SKILL: sign_auth_message — sign a plaintext auth message with the agent's wallet.
export const signAuthMessageAction: Action<typeof signAuthMessageSchema> = {
  name: "SIGN_AUTH_MESSAGE",
  similes: ["sign auth message", "sign siwe", "sign login message", "personal sign"],
  description: "Sign a SIWE-like plaintext message with the agent's wallet and return the signature.",
  examples: [
    {
      input: { message: "app.example.com wants you to sign in..." },
      output: ok("Message signed", { signature: "0xabc...", address: "0xagent" }),
      explanation: "Signs the auth message with the agent's account.",
    },
  ],
  schema: signAuthMessageSchema,
  handler: async (agent, input) => {
    try {
      const signature = await agent.walletClient.signMessage({
        account: agent.account,
        message: input.message,
      });
      return ok("Message signed", {
        signature,
        address: agent.address,
      });
    } catch (e) {
      return fail(`sign_auth_message failed: ${errorMessage(e)}`);
    }
  },
};
