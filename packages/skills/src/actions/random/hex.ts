import { z } from "zod";
import { randomBytes } from "node:crypto";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const randomHexSchema = z.object({
  bytes: z
    .number()
    .int()
    .min(1)
    .max(1024)
    .optional()
    .describe("Number of random bytes to generate (1-1024). Defaults to 32."),
});

/// SKILL: random_hex — cryptographically random 0x-prefixed hex string.
export const randomHexAction: Action<typeof randomHexSchema> = {
  name: "RANDOM_HEX",
  similes: ["random hex", "random bytes hex", "generate hex", "random nonce", "random salt"],
  description:
    "Generate a 0x-prefixed hex string from Node crypto random bytes. " +
    "Note: NOT intended to provide key-generation security guarantees beyond Node crypto.",
  examples: [
    {
      input: { bytes: 4 },
      output: ok("Random hex", { hex: "0xdeadbeef", bytes: 4 }),
      explanation: "Generates 4 random bytes as a hex string.",
    },
  ],
  schema: randomHexSchema,
  handler: async (_agent, input) => {
    try {
      const n = input.bytes ?? 32;
      const hex = "0x" + randomBytes(n).toString("hex");
      return ok("Random hex", { hex, bytes: n });
    } catch (e) {
      return fail(`random_hex failed: ${errorMessage(e)}`);
    }
  },
};
