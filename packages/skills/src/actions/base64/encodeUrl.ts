import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const base64UrlEncodeSchema = z.object({
  text: z.string().describe("UTF-8 text to encode as URL-safe Base64."),
});

/// SKILL: base64url_encode — encode UTF-8 text to a URL-safe Base64 string.
export const base64UrlEncodeAction: Action<typeof base64UrlEncodeSchema> = {
  name: "BASE64URL_ENCODE",
  similes: ["base64url encode", "url-safe base64", "encode base64url", "b64url encode"],
  description: "Encode UTF-8 text into a URL-safe Base64 string (base64url). No network access.",
  examples: [
    {
      input: { text: "hello?>" },
      output: ok("Base64url encoded", { b64url: "aGVsbG8_Pg" }),
      explanation: "Encodes text using the URL-safe Base64 alphabet without padding.",
    },
  ],
  schema: base64UrlEncodeSchema,
  handler: async (_agent, input) => {
    try {
      const b64url = Buffer.from(input.text, "utf8").toString("base64url");
      return ok("Base64url encoded", { text: input.text, b64url });
    } catch (e) {
      return fail(`base64url_encode failed: ${errorMessage(e)}`);
    }
  },
};
