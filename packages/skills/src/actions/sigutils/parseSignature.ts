import { z } from "zod";
import { parseSignature, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const parseSignatureSchema = z.object({
  signature: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, "Must be a 0x-prefixed hex signature")
    .describe("0x-prefixed hex signature (65 or 64 bytes)."),
});

/// SKILL: parse_signature — split a hex signature into r, s, v / yParity.
export const parseSignatureAction: Action<typeof parseSignatureSchema> = {
  name: "PARSE_SIGNATURE",
  similes: ["parse signature", "split signature", "signature components", "rsv"],
  description: "Parse a 0x-prefixed hex signature into its r, s, and v / yParity components.",
  examples: [
    {
      input: { signature: "0x" + "ab".repeat(65) },
      output: ok("Signature", { r: "0x...", s: "0x...", yParity: 1 }),
      explanation: "Splits the signature into components.",
    },
  ],
  schema: parseSignatureSchema,
  handler: async (_agent, input) => {
    try {
      const sig = parseSignature(input.signature as Hex);
      return ok("Signature", {
        r: sig.r,
        s: sig.s,
        v: sig.v === undefined ? null : sig.v.toString(),
        yParity: sig.yParity,
      });
    } catch (e) {
      return fail(`parse_signature failed: ${errorMessage(e)}`);
    }
  },
};
