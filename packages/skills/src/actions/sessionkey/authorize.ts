import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { sessionKeyManagerAbi } from "../../abi/sessionKeyManager.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const sessionAuthorizeSchema = z.object({
  sessionKey: addressSchema.describe("Session key address to authorize for delegated spending."),
  cap: decimalAmountSchema.describe("Maximum spend cap in native PHRS for this session key."),
  validUntil: z.coerce.number().int().nonnegative().describe("Unix timestamp after which the key expires."),
});

/// SKILL: session_authorize — grant a session key a capped, time-limited spending allowance.
export const sessionAuthorizeAction: Action<typeof sessionAuthorizeSchema> = {
  name: "SESSION_AUTHORIZE",
  similes: ["authorize session key", "grant session allowance", "delegate spending", "enable session key"],
  description: "Authorize a session key to spend up to a PHRS cap until a given expiry through the SessionKeyManager.",
  examples: [
    {
      input: { sessionKey: "0xabc", cap: "0.5", validUntil: 1800000000 },
      output: ok("Session key authorized", { txHash: "0x..." }),
      explanation: "Lets the session key spend up to 0.5 PHRS until the expiry.",
    },
  ],
  schema: sessionAuthorizeSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("sessionKeys");
      const hash = await agent.walletClient.writeContract({
        address: mgr,
        abi: sessionKeyManagerAbi,
        functionName: "authorize",
        args: [input.sessionKey, parseEther(input.cap), BigInt(input.validUntil)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Session key authorized", {
        sessionKey: input.sessionKey,
        cap: input.cap,
        validUntil: input.validUntil,
        txHash: hash,
      });
    } catch (e) {
      return fail(`session_authorize failed: ${errorMessage(e)}`);
    }
  },
};
