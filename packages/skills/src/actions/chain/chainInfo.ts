import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const chainInfoSchema = z.object({});

/// SKILL: get_chain_info — chain id, name, native currency, RPC.
export const chainInfoAction: Action<typeof chainInfoSchema> = {
  name: "GET_CHAIN_INFO",
  similes: ["chain id", "network info", "which network", "rpc url"],
  description: "Return the connected Pharos network's id, name, native currency, and RPC URL.",
  examples: [
    { input: {}, output: ok("Chain info", { chainId: 688689 }), explanation: "Reads network metadata." },
  ],
  schema: chainInfoSchema,
  handler: async (agent) => {
    try {
      return ok("Chain info", {
        chainId: agent.chain.id,
        name: agent.chain.name,
        nativeCurrency: agent.chain.nativeCurrency,
        rpcUrl: agent.rpcUrl,
        agent: agent.address,
      });
    } catch (e) {
      return fail(`get_chain_info failed: ${errorMessage(e)}`);
    }
  },
};
