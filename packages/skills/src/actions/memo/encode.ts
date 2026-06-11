import { z } from "zod";
import { stringToHex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const encodeMemoSchema = z.object({
  text: z.string().describe("UTF-8 text to encode as hex for use as transaction calldata/memo."),
});

/// SKILL: encode_memo — encode a UTF-8 string into 0x-prefixed hex calldata.
export const encodeMemoAction: Action<typeof encodeMemoSchema> = {
  name: "ENCODE_MEMO",
  similes: ["encode memo", "string to hex", "text to calldata", "memo to hex"],
  description: "Encode a UTF-8 string into 0x-prefixed hex, suitable for use as transaction calldata or an on-chain memo.",
  examples: [
    {
      input: { text: "gm" },
      output: ok("Encoded memo", { hex: "0x676d" }),
      explanation: "Encodes the UTF-8 string 'gm' to hex.",
    },
  ],
  schema: encodeMemoSchema,
  handler: async (_agent, input) => {
    try {
      const hex = stringToHex(input.text);
      return ok("Encoded memo", { hex });
    } catch (e) {
      return fail(`encode_memo failed: ${errorMessage(e)}`);
    }
  },
};
