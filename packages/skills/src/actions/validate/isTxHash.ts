import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;

export const isTxHashSchema = z.object({
  value: z.string().describe("String to test as a 32-byte transaction hash."),
});

/// SKILL: validate_is_tx_hash — check whether a string is a 32-byte tx hash.
export const isTxHashAction: Action<typeof isTxHashSchema> = {
  name: "VALIDATE_IS_TX_HASH",
  similes: ["is tx hash", "valid transaction hash", "check tx hash", "txhash validator"],
  description: "Pure validator: returns whether the given value is a 0x-prefixed 32-byte transaction hash.",
  examples: [
    {
      input: { value: "0x" + "a".repeat(64) },
      output: ok("Validated", { valid: true }),
      explanation: "A 0x-prefixed 64-hex-char string is a valid tx hash.",
    },
  ],
  schema: isTxHashSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Validated", { value: input.value, valid: TX_HASH_RE.test(input.value) });
    } catch (e) {
      return fail(`validate_is_tx_hash failed: ${errorMessage(e)}`);
    }
  },
};
