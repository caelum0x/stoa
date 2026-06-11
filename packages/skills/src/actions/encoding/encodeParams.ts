import { z } from "zod";
import { encodeAbiParameters, type AbiParameter } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const encodeParamsSchema = z.object({
  types: z.string().describe('JSON array of ABI parameter descriptors, e.g. \'[{"type":"address"},{"type":"uint256"}]\'.'),
  values: z.string().describe('JSON array of values matching the types, e.g. \'["0xabc","100"]\'.'),
});

/// SKILL: ENCODE_ABI_PARAMETERS — ABI-encode a tuple of values (no network).
export const encodeParamsAction: Action<typeof encodeParamsSchema> = {
  name: "ENCODE_ABI_PARAMETERS",
  similes: ["abi encode", "encode parameters", "encode abi", "pack abi values"],
  description: "ABI-encode a list of values against parameter types and return the hex data.",
  examples: [
    {
      input: { types: '[{"type":"uint256"}]', values: '["1"]' },
      output: ok("Encoded", { data: "0x0000...0001" }),
      explanation: "Encodes a single uint256.",
    },
  ],
  schema: encodeParamsSchema,
  handler: async (_agent, input) => {
    try {
      const types = JSON.parse(input.types) as readonly AbiParameter[];
      const values = JSON.parse(input.values) as readonly unknown[];
      const data = encodeAbiParameters(types, values);
      return ok("Encoded", { data });
    } catch (e) {
      return fail(`ENCODE_ABI_PARAMETERS failed: ${errorMessage(e)}`);
    }
  },
};
