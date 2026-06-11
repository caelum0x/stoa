import { z } from "zod";
import { sha256, stringToHex, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const sha256Schema = z.object({
  data: z.string().describe("Data to hash. If it starts with 0x it is treated as raw hex, otherwise as a UTF-8 string."),
});

/// SKILL: sha256_hash — compute the SHA-256 hash of hex or string data.
export const sha256Action: Action<typeof sha256Schema> = {
  name: "SHA256_HASH",
  similes: ["sha256", "sha-256 hash", "hash with sha256", "compute sha256"],
  description: "Compute the SHA-256 hash of hex data (0x-prefixed) or a UTF-8 string.",
  examples: [
    {
      input: { data: "hello" },
      output: ok("SHA-256 hash", { hash: "0x2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824" }),
      explanation: "Hashes the UTF-8 string 'hello'.",
    },
  ],
  schema: sha256Schema,
  handler: async (_agent, input) => {
    try {
      const bytes: Hex = input.data.startsWith("0x") ? (input.data as Hex) : stringToHex(input.data);
      return ok("SHA-256 hash", { hash: sha256(bytes) });
    } catch (e) {
      return fail(`sha256_hash failed: ${errorMessage(e)}`);
    }
  },
};
