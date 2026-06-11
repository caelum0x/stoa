import { z } from "zod";
import { randomUUID } from "node:crypto";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const randomUuidSchema = z.object({});

/// SKILL: random_uuid — generate a random RFC 4122 v4 UUID.
export const randomUuidAction: Action<typeof randomUuidSchema> = {
  name: "RANDOM_UUID",
  similes: ["random uuid", "generate uuid", "uuid", "guid", "unique id"],
  description: "Generate a random RFC 4122 version 4 UUID using Node crypto.",
  examples: [
    {
      input: {},
      output: ok("Random UUID", { uuid: "f47ac10b-58cc-4372-a567-0e02b2c3d479" }),
      explanation: "Generates a v4 UUID.",
    },
  ],
  schema: randomUuidSchema,
  handler: async (_agent, _input) => {
    try {
      const uuid = randomUUID();
      return ok("Random UUID", { uuid });
    } catch (e) {
      return fail(`random_uuid failed: ${errorMessage(e)}`);
    }
  },
};
