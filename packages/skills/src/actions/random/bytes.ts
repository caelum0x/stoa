import { z } from "zod";
import { randomBytes } from "node:crypto";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const randomBytesSchema = z.object({
  length: z
    .number()
    .int()
    .min(1)
    .max(1024)
    .optional()
    .describe("Number of random bytes to generate (1-1024). Defaults to 32."),
});

/// SKILL: random_bytes — array of cryptographically random byte values (0-255).
export const randomBytesAction: Action<typeof randomBytesSchema> = {
  name: "RANDOM_BYTES",
  similes: ["random bytes", "random byte array", "generate bytes", "random entropy"],
  description: "Generate an array of random byte values (0-255) from Node crypto.",
  examples: [
    {
      input: { length: 3 },
      output: ok("Random bytes", { bytes: [12, 240, 7], length: 3 }),
      explanation: "Generates 3 random byte values.",
    },
  ],
  schema: randomBytesSchema,
  handler: async (_agent, input) => {
    try {
      const n = input.length ?? 32;
      const bytes = Array.from(randomBytes(n));
      return ok("Random bytes", { bytes, length: n });
    } catch (e) {
      return fail(`random_bytes failed: ${errorMessage(e)}`);
    }
  },
};
