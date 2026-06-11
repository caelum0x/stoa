import { z } from "zod";
import { ripemd160, stringToHex, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const ripemd160Schema = z.object({
  data: z.string().describe("Data to hash. If it starts with 0x it is treated as raw hex, otherwise as a UTF-8 string."),
});

/// SKILL: ripemd160_hash — compute the RIPEMD-160 hash of hex or string data.
export const ripemd160Action: Action<typeof ripemd160Schema> = {
  name: "RIPEMD160_HASH",
  similes: ["ripemd160", "ripemd-160 hash", "hash with ripemd160", "compute ripemd160"],
  description: "Compute the RIPEMD-160 hash of hex data (0x-prefixed) or a UTF-8 string.",
  examples: [
    {
      input: { data: "hello" },
      output: ok("RIPEMD-160 hash", { hash: "0x108f07b8382412612c048d07d13f814118445acd" }),
      explanation: "Hashes the UTF-8 string 'hello'.",
    },
  ],
  schema: ripemd160Schema,
  handler: async (_agent, input) => {
    try {
      const bytes: Hex = input.data.startsWith("0x") ? (input.data as Hex) : stringToHex(input.data);
      return ok("RIPEMD-160 hash", { hash: ripemd160(bytes) });
    } catch (e) {
      return fail(`ripemd160_hash failed: ${errorMessage(e)}`);
    }
  },
};
