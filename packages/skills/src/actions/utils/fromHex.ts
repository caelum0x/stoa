import { z } from "zod";
import { fromHex, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const fromHexSchema = z.object({
  hex: z.string().regex(/^0x[0-9a-fA-F]*$/, "Must be a 0x-prefixed hex string").describe("Hex value to decode."),
  to: z.enum(["string", "number", "bigint"]).describe("Target type to decode into."),
});

/// SKILL: from_hex — decode a 0x hex value into a string, number, or bigint.
export const fromHexAction: Action<typeof fromHexSchema> = {
  name: "FROM_HEX",
  similes: ["decode hex", "from hex", "hex to number", "parse hex"],
  description: "Decode a 0x-prefixed hex value into a string, number, or bigint.",
  examples: [
    {
      input: { hex: "0x1a4", to: "number" },
      output: ok("Decoded", { value: 420 }),
      explanation: "Decodes hex to a number.",
    },
  ],
  schema: fromHexSchema,
  handler: async (_agent, input) => {
    try {
      const hex = input.hex as Hex;
      if (input.to === "bigint") {
        return ok("Decoded", { value: fromHex(hex, "bigint").toString() });
      }
      const value = input.to === "number" ? fromHex(hex, "number") : fromHex(hex, "string");
      return ok("Decoded", { value });
    } catch (e) {
      return fail(`from_hex failed: ${errorMessage(e)}`);
    }
  },
};
