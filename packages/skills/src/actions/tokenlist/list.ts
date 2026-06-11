import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { KNOWN_TOKENS } from "./registry.js";

export const listKnownTokensSchema = z.object({});

/// SKILL: list_known_tokens — list all tokens in the Stoa known-token registry.
export const listKnownTokensAction: Action<typeof listKnownTokensSchema> = {
  name: "LIST_KNOWN_TOKENS",
  similes: ["list tokens", "known tokens", "supported tokens", "token registry"],
  description: "Return the full registry of well-known tokens on Pharos, mapping symbol to address, decimals, and name.",
  examples: [
    {
      input: {},
      output: ok("Known tokens", {
        PHRS: { address: "native", decimals: 18, name: "Pharos" },
      }),
      explanation: "Lists every token in the known-token registry.",
    },
  ],
  schema: listKnownTokensSchema,
  handler: async () => {
    try {
      return ok("Known tokens", { tokens: KNOWN_TOKENS, count: Object.keys(KNOWN_TOKENS).length });
    } catch (e) {
      return fail(`list_known_tokens failed: ${errorMessage(e)}`);
    }
  },
};
