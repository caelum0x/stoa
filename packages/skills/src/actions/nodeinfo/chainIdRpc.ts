import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const chainIdRpcSchema = z.object({});

/// SKILL: chain_id_rpc — chain id directly from the node via eth_chainId.
export const chainIdRpcAction: Action<typeof chainIdRpcSchema> = {
  name: "CHAIN_ID_RPC",
  similes: ["chain id", "eth chainId", "network id rpc", "what chain"],
  description: "Return the Pharos chain id straight from the node via the eth_chainId JSON-RPC method, as both the raw hex string and a parsed decimal number.",
  examples: [
    {
      input: {},
      output: ok("Chain id", { hex: "0xc352", chainId: 50002 }),
      explanation: "Reads eth_chainId and parses the hex into a decimal number.",
    },
  ],
  schema: chainIdRpcSchema,
  handler: async (agent, _input) => {
    try {
      const result = await agent.publicClient.request({
        method: "eth_chainId",
        params: [],
      } as any);
      const hex = typeof result === "string" ? result : String(result ?? "0x0");
      return ok("Chain id", { hex, chainId: Number(hex) });
    } catch (e) {
      return fail(`chain_id_rpc failed: ${errorMessage(e)}`);
    }
  },
};
