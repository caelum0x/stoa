import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const base64DecodeSchema = z.object({
  b64: z.string().describe("Standard Base64 string to decode to UTF-8 text."),
});

/// SKILL: base64_decode — decode a standard Base64 string to UTF-8 text.
export const base64DecodeAction: Action<typeof base64DecodeSchema> = {
  name: "BASE64_DECODE",
  similes: ["base64 decode", "decode base64", "from base64", "b64 decode"],
  description: "Decode a standard Base64 string into UTF-8 text. No network access.",
  examples: [
    {
      input: { b64: "aGVsbG8=" },
      output: ok("Base64 decoded", { text: "hello" }),
      explanation: "Decodes the Base64 string to \"hello\".",
    },
  ],
  schema: base64DecodeSchema,
  handler: async (_agent, input) => {
    try {
      const text = Buffer.from(input.b64, "base64").toString("utf8");
      return ok("Base64 decoded", { b64: input.b64, text });
    } catch (e) {
      return fail(`base64_decode failed: ${errorMessage(e)}`);
    }
  },
};
