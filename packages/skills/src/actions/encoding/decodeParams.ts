import { z } from "zod";
import { decodeAbiParameters, type AbiParameter, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const decodeParamsSchema = z.object({
  types: z.string().describe('JSON array of ABI parameter descriptors, e.g. \'[{"type":"address"},{"type":"uint256"}]\'.'),
  data: z.string().describe("0x-prefixed ABI-encoded hex data to decode."),
});

/// SKILL: DECODE_ABI_PARAMETERS — decode ABI-encoded hex against types (no network).
export const decodeParamsAction: Action<typeof decodeParamsSchema> = {
  name: "DECODE_ABI_PARAMETERS",
  similes: ["abi decode", "decode parameters", "unpack abi", "decode abi data"],
  description: "Decode ABI-encoded hex data against parameter types; bigint values become strings.",
  examples: [
    {
      input: { types: '[{"type":"uint256"}]', data: "0x0000000000000000000000000000000000000000000000000000000000000001" },
      output: ok("Decoded", { values: ["1"] }),
      explanation: "Decodes a single uint256.",
    },
  ],
  schema: decodeParamsSchema,
  handler: async (_agent, input) => {
    try {
      const types = JSON.parse(input.types) as readonly AbiParameter[];
      const decoded = decodeAbiParameters(types, input.data as Hex);
      const values = JSON.parse(JSON.stringify(decoded, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
      return ok("Decoded", { values });
    } catch (e) {
      return fail(`DECODE_ABI_PARAMETERS failed: ${errorMessage(e)}`);
    }
  },
};
