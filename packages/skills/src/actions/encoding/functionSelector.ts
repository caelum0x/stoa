import { z } from "zod";
import { toFunctionSelector } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const functionSelectorSchema = z.object({
  signature: z.string().describe('Function signature, e.g. "transfer(address,uint256)".'),
});

/// SKILL: FUNCTION_SELECTOR — 4-byte selector from a function signature (no network).
export const functionSelectorAction: Action<typeof functionSelectorSchema> = {
  name: "FUNCTION_SELECTOR",
  similes: ["function selector", "method id", "4byte selector", "function sig hash"],
  description: "Compute the 4-byte function selector for a Solidity function signature.",
  examples: [
    {
      input: { signature: "transfer(address,uint256)" },
      output: ok("Selector", { selector: "0xa9059cbb" }),
      explanation: "Selector for ERC-20 transfer.",
    },
  ],
  schema: functionSelectorSchema,
  handler: async (_agent, input) => {
    try {
      const selector = toFunctionSelector(input.signature);
      return ok("Selector", { signature: input.signature, selector });
    } catch (e) {
      return fail(`FUNCTION_SELECTOR failed: ${errorMessage(e)}`);
    }
  },
};
