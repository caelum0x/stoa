import { z } from "zod";
import { keccak256, stringToHex, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const keccakSchema = z.object({
  data: z.string().describe("Data to hash. If it starts with 0x it is treated as raw hex, otherwise as a UTF-8 string."),
});

/// SKILL: keccak256 — compute the keccak-256 hash of hex or string data.
export const keccakAction: Action<typeof keccakSchema> = {
  name: "KECCAK256",
  similes: ["keccak", "hash data", "keccak256 hash", "solidity hash"],
  description: "Compute the keccak-256 hash of hex data (0x-prefixed) or a UTF-8 string.",
  examples: [
    {
      input: { data: "hello" },
      output: ok("Hash", { hash: "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8" }),
      explanation: "Hashes the UTF-8 string 'hello'.",
    },
  ],
  schema: keccakSchema,
  handler: async (_agent, input) => {
    try {
      const bytes = input.data.startsWith("0x") ? (input.data as Hex) : stringToHex(input.data);
      return ok("Hash", { hash: keccak256(bytes) });
    } catch (e) {
      return fail(`keccak256 failed: ${errorMessage(e)}`);
    }
  },
};
