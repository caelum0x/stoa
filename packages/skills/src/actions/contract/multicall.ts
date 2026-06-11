import { z } from "zod";
import { type Abi } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const callSchema = z.object({
  address: addressSchema.describe("Contract address."),
  abi: z.string().describe("Contract ABI as a JSON string."),
  functionName: z.string().describe("View/pure function name to call."),
  args: z.array(z.unknown()).optional().describe("Function arguments (default empty)."),
});

export const contractMulticallSchema = z.object({
  calls: z.array(callSchema).min(1).describe("Batch of contract reads to aggregate."),
});

const jsonSafe = (x: unknown): unknown =>
  JSON.parse(JSON.stringify(x, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));

/// SKILL: contract_multicall — batch multiple contract reads in one RPC round-trip.
export const contractMulticallAction: Action<typeof contractMulticallSchema> = {
  name: "CONTRACT_MULTICALL",
  similes: ["multicall", "batch read", "aggregate calls", "batch contract reads"],
  description: "Aggregate many contract view calls into a single multicall, returning each result (allowing failures).",
  examples: [
    {
      input: { calls: [{ address: "0xabc", abi: "[...]", functionName: "totalSupply" }] },
      output: ok("Multicall results", { results: [] }),
      explanation: "Batches several reads into one request.",
    },
  ],
  schema: contractMulticallSchema,
  handler: async (agent, input) => {
    try {
      const contracts = input.calls.map((c) => ({
        address: c.address,
        abi: JSON.parse(c.abi) as Abi,
        functionName: c.functionName,
        args: c.args ?? [],
      }));
      const results = await agent.publicClient.multicall({ contracts, allowFailure: true });
      return ok("Multicall results", { count: results.length, results: jsonSafe(results) });
    } catch (e) {
      return fail(`contract_multicall failed: ${errorMessage(e)}`);
    }
  },
};
