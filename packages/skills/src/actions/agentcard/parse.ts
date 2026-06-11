import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const parseAgentCardSchema = z.object({
  uri: z.string().describe('Agent card data URI, e.g. "data:application/json,...".'),
});

const PREFIX = "data:application/json,";

/// SKILL: parse_agent_card — decode an agent card data URI into its JSON object.
export const parseAgentCardAction: Action<typeof parseAgentCardSchema> = {
  name: "PARSE_AGENT_CARD",
  similes: ["parse agent card", "decode agent card", "read agent card", "agent card from uri"],
  description: 'Decode a "data:application/json," agent card URI back into its JSON object.',
  examples: [
    {
      input: { uri: "data:application/json,%7B%22name%22%3A%22Stoa%22%7D" },
      output: ok("Agent card", { card: { name: "Stoa" } }),
      explanation: "Decodes a minimal agent card.",
    },
  ],
  schema: parseAgentCardSchema,
  handler: async (_agent, input) => {
    try {
      if (!input.uri.startsWith(PREFIX)) {
        return fail("parse_agent_card failed: expected a \"data:application/json,\" data URI");
      }
      const encoded = input.uri.slice(PREFIX.length);
      const card: unknown = JSON.parse(decodeURIComponent(encoded));
      return ok("Agent card", { card });
    } catch (e) {
      return fail(`parse_agent_card failed: ${errorMessage(e)}`);
    }
  },
};
