import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const rawRpcRequestSchema = z.object({
  method: z.string().describe("JSON-RPC method name, e.g. 'eth_chainId'."),
  params: z.array(z.unknown()).optional().describe("Positional params array; empty if omitted."),
});

/// Bigint-safe deep serialization for arbitrary RPC results.
const serialize = (x: unknown): unknown =>
  JSON.parse(JSON.stringify(x, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));

/// SKILL: raw_rpc_request — advanced escape-hatch for arbitrary JSON-RPC calls.
export const rawRpcRequestAction: Action<typeof rawRpcRequestSchema> = {
  name: "RAW_RPC_REQUEST",
  similes: ["raw rpc", "json-rpc call", "eth call method", "rpc request", "low level rpc"],
  description:
    "Advanced escape-hatch: send a raw JSON-RPC request to the Pharos node and return the result. Use only when no dedicated skill exists.",
  examples: [
    {
      input: { method: "eth_chainId" },
      output: ok("RPC result", { method: "eth_chainId", result: "0x..." }),
      explanation: "Calls eth_chainId with no params.",
    },
  ],
  schema: rawRpcRequestSchema,
  handler: async (agent, input) => {
    try {
      const result = await agent.publicClient.request({
        method: input.method,
        params: input.params ?? [],
      } as any);
      return ok("RPC result", { method: input.method, result: serialize(result) });
    } catch (e) {
      return fail(`raw_rpc_request failed: ${errorMessage(e)}`);
    }
  },
};
