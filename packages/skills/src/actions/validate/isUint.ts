import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

const UINT_RE = /^\d+$/;

export const isUintSchema = z.object({
  value: z.string().describe("String to test as a non-negative integer (uint)."),
});

/// SKILL: validate_is_uint — check whether a string is a non-negative integer.
export const isUintAction: Action<typeof isUintSchema> = {
  name: "VALIDATE_IS_UINT",
  similes: ["is uint", "valid uint", "non-negative integer", "uint validator"],
  description: "Pure validator: returns whether the given value is a non-negative integer string (uint).",
  examples: [
    {
      input: { value: "12345" },
      output: ok("Validated", { valid: true }),
      explanation: "12345 is a valid non-negative integer.",
    },
  ],
  schema: isUintSchema,
  handler: async (_agent, input) => {
    try {
      const valid = UINT_RE.test(input.value) && BigInt(input.value) >= 0n;
      return ok("Validated", { value: input.value, valid });
    } catch (e) {
      return fail(`validate_is_uint failed: ${errorMessage(e)}`);
    }
  },
};
