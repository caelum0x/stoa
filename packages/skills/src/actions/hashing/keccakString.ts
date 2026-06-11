import { z } from "zod";
import { keccak256, stringToHex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const keccakStringSchema = z.object({
  value: z.string().describe("UTF-8 string to hash with keccak-256."),
});

/// SKILL: keccak_string — keccak-256 hash of a UTF-8 string.
export const keccakStringAction: Action<typeof keccakStringSchema> = {
  name: "KECCAK_STRING",
  similes: ["keccak string", "hash string keccak", "keccak256 of string", "solidity string hash"],
  description: "Compute the keccak-256 hash of a UTF-8 string (encoded to hex first).",
  examples: [
    {
      input: { value: "hello" },
      output: ok("Keccak-256 hash", { hash: "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8" }),
      explanation: "Hashes the UTF-8 string 'hello'.",
    },
  ],
  schema: keccakStringSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Keccak-256 hash", { hash: keccak256(stringToHex(input.value)) });
    } catch (e) {
      return fail(`keccak_string failed: ${errorMessage(e)}`);
    }
  },
};
