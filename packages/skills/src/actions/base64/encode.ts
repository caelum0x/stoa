import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const base64EncodeSchema = z.object({
  text: z.string().describe("UTF-8 text to encode as standard Base64."),
});

/// SKILL: base64_encode — encode UTF-8 text to a standard Base64 string.
export const base64EncodeAction: Action<typeof base64EncodeSchema> = {
  name: "BASE64_ENCODE",
  similes: ["base64 encode", "encode base64", "to base64", "b64 encode"],
  description: "Encode UTF-8 text into a standard Base64 string. No network access.",
  examples: [
    {
      input: { text: "hello" },
      output: ok("Base64 encoded", { b64: "aGVsbG8=" }),
      explanation: "Encodes the string \"hello\" to Base64.",
    },
  ],
  schema: base64EncodeSchema,
  handler: async (_agent, input) => {
    try {
      const b64 = Buffer.from(input.text, "utf8").toString("base64");
      return ok("Base64 encoded", { text: input.text, b64 });
    } catch (e) {
      return fail(`base64_encode failed: ${errorMessage(e)}`);
    }
  },
};
