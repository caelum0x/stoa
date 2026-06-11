import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { sessionKeyManagerAbi } from "../../abi/sessionKeyManager.js";
import { addressSchema } from "../../schemas.js";

export const sessionAllowanceSchema = z.object({
  owner: addressSchema.optional().describe("Owner address. Defaults to the agent's own address."),
  sessionKey: addressSchema.describe("Session key address whose allowance to read."),
});

/// SKILL: session_allowance — read a session key's remaining cap, expiry, and active status.
export const sessionAllowanceAction: Action<typeof sessionAllowanceSchema> = {
  name: "SESSION_ALLOWANCE",
  similes: ["session allowance", "check session cap", "session key status", "read delegated allowance"],
  description: "Read the spending cap, expiry, and active flag for a session key under an owner from the SessionKeyManager.",
  examples: [
    {
      input: { sessionKey: "0xabc" },
      output: ok("Session allowance read", { cap: "0.5", validUntil: 1800000000, active: true }),
      explanation: "Reads the allowance for the session key under the agent's address.",
    },
  ],
  schema: sessionAllowanceSchema,
  handler: async (agent, input) => {
    try {
      const mgr = agent.requireContract("sessionKeys");
      const owner = input.owner ?? agent.address;
      const [cap, validUntil, active] = await agent.publicClient.readContract({
        address: mgr,
        abi: sessionKeyManagerAbi,
        functionName: "allowanceOf",
        args: [owner, input.sessionKey],
      });
      return ok("Session allowance read", {
        owner,
        sessionKey: input.sessionKey,
        cap: formatEther(cap),
        validUntil: Number(validUntil),
        active,
      });
    } catch (e) {
      return fail(`session_allowance failed: ${errorMessage(e)}`);
    }
  },
};
