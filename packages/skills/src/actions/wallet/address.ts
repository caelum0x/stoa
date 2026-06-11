import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const agentAddressSchema = z.object({});

/// SKILL: get_agent_address — the agent's own address.
export const agentAddressAction: Action<typeof agentAddressSchema> = {
  name: "GET_AGENT_ADDRESS",
  similes: ["my address", "agent address", "who am i", "wallet address"],
  description: "Return the agent's own on-chain address and chain id.",
  examples: [
    { input: {}, output: ok("Agent address", { address: "0x..." }), explanation: "Reveals the agent address." },
  ],
  schema: agentAddressSchema,
  handler: async (agent) => {
    try {
      return ok("Agent address", { address: agent.address, chainId: agent.chain.id });
    } catch (e) {
      return fail(`get_agent_address failed: ${errorMessage(e)}`);
    }
  },
};
