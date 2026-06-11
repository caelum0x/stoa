import { z } from "zod";
import { type Abi } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const contractReadSchema = z.object({
  address: addressSchema.describe("Contract address to read from."),
  abi: z.string().describe("Contract ABI as a JSON string."),
  functionName: z.string().describe("View/pure function name to call."),
  args: z.array(z.unknown()).optional().describe("Function arguments (default empty)."),
});

const jsonSafe = (x: unknown): unknown =>
  JSON.parse(JSON.stringify(x, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));

/// SKILL: contract_read — call any view/pure function on a contract.
export const contractReadAction: Action<typeof contractReadSchema> = {
  name: "CONTRACT_READ",
  similes: ["read contract", "call view function", "eth_call", "query contract"],
  description: "Read from any contract by calling a view/pure function with a supplied ABI.",
  examples: [
    {
      input: { address: "0xabc", abi: "[...]", functionName: "totalSupply" },
      output: ok("Contract read", { result: "1000000" }),
      explanation: "Calls a view function and returns the result.",
    },
  ],
  schema: contractReadSchema,
  handler: async (agent, input) => {
    try {
      const abi = JSON.parse(input.abi) as Abi;
      const result = await agent.publicClient.readContract({
        address: input.address,
        abi,
        functionName: input.functionName,
        args: input.args ?? [],
      });
      return ok("Contract read", {
        address: input.address,
        functionName: input.functionName,
        result: jsonSafe(result),
      });
    } catch (e) {
      return fail(`contract_read failed: ${errorMessage(e)}`);
    }
  },
};
