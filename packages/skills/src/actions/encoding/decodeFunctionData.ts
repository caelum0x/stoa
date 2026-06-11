import { z } from "zod";
import { decodeFunctionData, type Abi, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const decodeFunctionDataSchema = z.object({
  abi: z.string().describe("JSON array ABI (the contract or function ABI)."),
  data: z.string().describe("0x-prefixed calldata to decode (selector + args)."),
});

/// SKILL: DECODE_FUNCTION_DATA — decode calldata into function name + args (no network).
export const decodeFunctionDataAction: Action<typeof decodeFunctionDataSchema> = {
  name: "DECODE_FUNCTION_DATA",
  similes: ["decode calldata", "decode function call", "parse calldata", "abi decode call"],
  description: "Decode calldata against an ABI into the matched function name and arguments; bigints become strings.",
  examples: [
    {
      input: { abi: '[{"type":"function","name":"transfer","inputs":[{"type":"address"},{"type":"uint256"}]}]', data: "0xa9059cbb" },
      output: ok("Decoded", { functionName: "transfer", args: [] }),
      explanation: "Decodes a transfer call.",
    },
  ],
  schema: decodeFunctionDataSchema,
  handler: async (_agent, input) => {
    try {
      const abi = JSON.parse(input.abi) as Abi;
      const decoded = decodeFunctionData({ abi, data: input.data as Hex });
      const safe = JSON.parse(JSON.stringify(decoded, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
      return ok("Decoded", { functionName: safe.functionName, args: safe.args ?? [] });
    } catch (e) {
      return fail(`DECODE_FUNCTION_DATA failed: ${errorMessage(e)}`);
    }
  },
};
