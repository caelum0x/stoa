import { z } from "zod";
import { namehash } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const namehashSchema = z.object({
  name: z.string().describe("ENS-style name to hash, e.g. \"alice.eth\"."),
});

/// SKILL: namehash — compute the ENS namehash of a name.
export const namehashAction: Action<typeof namehashSchema> = {
  name: "NAMEHASH",
  similes: ["ens namehash", "namehash", "name hash", "ens node"],
  description: "Compute the ENS namehash (node) for a dotted name.",
  examples: [
    {
      input: { name: "alice.eth" },
      output: ok("Namehash", { node: "0x787192fc5378cc32aa956ddfdedbf26b24e8d78e40109add0eea2c1a012c3dec" }),
      explanation: "Hashes alice.eth.",
    },
  ],
  schema: namehashSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Namehash", { node: namehash(input.name) });
    } catch (e) {
      return fail(`namehash failed: ${errorMessage(e)}`);
    }
  },
};
