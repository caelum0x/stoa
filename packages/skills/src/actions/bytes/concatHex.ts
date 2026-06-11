import { z } from "zod";
import { concat, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const concatHexSchema = z.object({
  values: z
    .array(z.string())
    .min(1)
    .describe("Array of 0x-prefixed hex strings to concatenate in order."),
});

/// SKILL: concat_hex — concatenate multiple 0x-prefixed hex strings into one.
export const concatHexAction: Action<typeof concatHexSchema> = {
  name: "CONCAT_HEX",
  similes: ["concat hex", "join hex", "concatenate bytes", "merge hex strings"],
  description: "Concatenate multiple 0x-prefixed hex strings into a single hex string.",
  examples: [
    {
      input: { values: ["0x1234", "0x5678"] },
      output: ok("Concatenated", { hex: "0x12345678" }),
      explanation: "Joins two hex strings end to end.",
    },
  ],
  schema: concatHexSchema,
  handler: async (_agent, input) => {
    try {
      const hex = concat(input.values as Hex[]);
      return ok("Concatenated", { values: input.values, hex });
    } catch (e) {
      return fail(`concat_hex failed: ${errorMessage(e)}`);
    }
  },
};
