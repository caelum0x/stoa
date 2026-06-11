import { z } from "zod";
import { encodeFunctionData, type Abi } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const encodeFunctionDataSchema = z.object({
  abi: z.string().describe("JSON array ABI (the contract or function ABI)."),
  functionName: z.string().describe("Name of the function to encode a call for."),
  args: z.string().optional().describe("JSON array of call arguments. Omit for no-arg functions."),
});

/// SKILL: ENCODE_FUNCTION_DATA — calldata for a function call from ABI (no network).
export const encodeFunctionDataAction: Action<typeof encodeFunctionDataSchema> = {
  name: "ENCODE_FUNCTION_DATA",
  similes: ["encode calldata", "encode function call", "build calldata", "abi encode call"],
  description: "Encode calldata (selector + args) for a function call given an ABI and arguments.",
  examples: [
    {
      input: { abi: '[{"type":"function","name":"transfer","inputs":[{"type":"address"},{"type":"uint256"}]}]', functionName: "transfer", args: '["0xabc","1"]' },
      output: ok("Encoded", { data: "0xa9059cbb..." }),
      explanation: "Encodes a transfer call.",
    },
  ],
  schema: encodeFunctionDataSchema,
  handler: async (_agent, input) => {
    try {
      const abi = JSON.parse(input.abi) as Abi;
      const args = input.args === undefined ? undefined : (JSON.parse(input.args) as readonly unknown[]);
      const data = encodeFunctionData({ abi, functionName: input.functionName, args });
      return ok("Encoded", { functionName: input.functionName, data });
    } catch (e) {
      return fail(`ENCODE_FUNCTION_DATA failed: ${errorMessage(e)}`);
    }
  },
};
