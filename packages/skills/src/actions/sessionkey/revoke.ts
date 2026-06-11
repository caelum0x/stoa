import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { sessionKeyManagerAbi } from "../../abi/sessionKeyManager.js";
import { addressSchema } from "../../schemas.js";

export const sessionRevokeSchema = z.object({
  sessionKey: addressSchema.describe("Session key address to revoke."),
});

/// SKILL: session_revoke — immediately revoke a session key's delegated spending authority.
export const sessionRevokeAction: Action<typeof sessionRevokeSchema> = {
  name: "SESSION_REVOKE",
  similes: ["revoke session key", "disable session key", "cancel delegation", "remove session allowance"],
  description: "Revoke a previously authorized session key so it can no longer spend through the SessionKeyManager.",
  examples: [
    {
      input: { sessionKey: "0xabc" },
      output: ok("Session key revoked", { txHash: "0x..." }),
      explanation: "Revokes the session key's spending authority.",
    },
  ],
  schema: sessionRevokeSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("sessionKeys");
      const hash = await agent.walletClient.writeContract({
        address: mgr,
        abi: sessionKeyManagerAbi,
        functionName: "revoke",
        args: [input.sessionKey],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Session key revoked", {
        sessionKey: input.sessionKey,
        txHash: hash,
      });
    } catch (e) {
      return fail(`session_revoke failed: ${errorMessage(e)}`);
    }
  },
};
