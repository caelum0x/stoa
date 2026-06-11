import { z } from "zod";
import { type Abi } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const contractSimulateSchema = z.object({
  address: addressSchema.describe("Contract address to simulate against."),
  abi: z.string().describe("Contract ABI as a JSON string."),
  functionName: z.string().describe("Function name to simulate."),
  args: z.array(z.unknown()).optional().describe("Function arguments (default empty)."),
});

const jsonSafe = (x: unknown): unknown =>
  JSON.parse(JSON.stringify(x, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));

/// SKILL: contract_simulate — dry-run a contract call without sending a tx.
export const contractSimulateAction: Action<typeof contractSimulateSchema> = {
  name: "CONTRACT_SIMULATE",
  similes: ["simulate contract", "dry run", "static call", "preview transaction"],
  description: "Simulate a contract call from the agent's account without broadcasting, returning the would-be result.",
  examples: [
    {
      input: { address: "0xabc", abi: "[...]", functionName: "mint", args: ["0xdef", "1"] },
      output: ok("Simulation ok", { result: null }),
      explanation: "Simulates a call and returns its result.",
    },
  ],
  schema: contractSimulateSchema,
  handler: async (agent, input) => {
    try {
      const abi = JSON.parse(input.abi) as Abi;
      const { result } = await agent.publicClient.simulateContract({
        account: agent.account,
        address: input.address,
        abi,
        functionName: input.functionName,
        args: input.args ?? [],
      });
      return ok("Simulation ok", {
        address: input.address,
        functionName: input.functionName,
        result: jsonSafe(result),
      });
    } catch (e) {
      return fail(`contract_simulate failed: ${errorMessage(e)}`);
    }
  },
};
