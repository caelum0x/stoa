import { z } from "zod";
import { parseAbi } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const parseAbiSchema = z.object({
  signatures: z.array(z.string()).describe("Human-readable ABI signatures, e.g. [\"function transfer(address,uint256)\"]."),
});

/// SKILL: parse_abi — parse human-readable ABI signatures into a JSON ABI.
export const parseAbiAction: Action<typeof parseAbiSchema> = {
  name: "PARSE_ABI",
  similes: ["parse abi", "human readable abi", "signatures to abi", "compile abi"],
  description: "Convert an array of human-readable ABI signatures into a structured JSON ABI.",
  examples: [
    {
      input: { signatures: ["function balanceOf(address) view returns (uint256)"] },
      output: ok("Parsed ABI", { abi: [] }),
      explanation: "Parses one function signature into its JSON ABI item.",
    },
  ],
  schema: parseAbiSchema,
  handler: async (_agent, input) => {
    try {
      const abi = parseAbi(input.signatures);
      return ok("Parsed ABI", { abi: JSON.parse(JSON.stringify(abi)) });
    } catch (e) {
      return fail(`parse_abi failed: ${errorMessage(e)}`);
    }
  },
};
