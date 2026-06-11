import { z } from "zod";
import { serializeSignature, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const serializeSignatureSchema = z.object({
  r: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, "Must be a 0x-prefixed hex value")
    .describe("0x-prefixed r component."),
  s: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, "Must be a 0x-prefixed hex value")
    .describe("0x-prefixed s component."),
  yParity: z.coerce.number().int().min(0).max(1).describe("y-parity (0 or 1)."),
});

/// SKILL: serialize_signature — combine r, s, yParity into a hex signature.
export const serializeSignatureAction: Action<typeof serializeSignatureSchema> = {
  name: "SERIALIZE_SIGNATURE",
  similes: ["serialize signature", "combine signature", "encode signature", "join rsv"],
  description: "Serialize r, s, and yParity components into a single 0x-prefixed hex signature.",
  examples: [
    {
      input: { r: "0x" + "ab".repeat(32), s: "0x" + "cd".repeat(32), yParity: 1 },
      output: ok("Signature", { signature: "0x..." }),
      explanation: "Combines components into a hex signature.",
    },
  ],
  schema: serializeSignatureSchema,
  handler: async (_agent, input) => {
    try {
      const signature = serializeSignature({
        r: input.r as Hex,
        s: input.s as Hex,
        yParity: input.yParity,
      });
      return ok("Signature", { signature });
    } catch (e) {
      return fail(`serialize_signature failed: ${errorMessage(e)}`);
    }
  },
};
