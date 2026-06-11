import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const buildAgentCardSchema = z.object({
  name: z.string().describe("Human-readable agent name."),
  description: z.string().optional().describe("Short description of the agent."),
  capabilities: z.array(z.string()).optional().describe("List of agent capabilities."),
  endpoint: z.string().optional().describe("Agent service endpoint URL."),
});

/// SKILL: build_agent_card — compose an agent card JSON object and a data URI.
export const buildAgentCardAction: Action<typeof buildAgentCardSchema> = {
  name: "BUILD_AGENT_CARD",
  similes: ["build agent card", "create agent card", "agent metadata", "make agent card"],
  description: "Compose an agent card JSON object (name, description, capabilities, endpoint, agent address) and a data: URI encoding it.",
  examples: [
    {
      input: { name: "Stoa", capabilities: ["pay", "swap"] },
      output: ok("Agent card", { uri: "data:application/json,..." }),
      explanation: "Builds a card for the agent with two capabilities.",
    },
  ],
  schema: buildAgentCardSchema,
  handler: async (agent, input) => {
    try {
      const card = {
        name: input.name,
        description: input.description,
        capabilities: input.capabilities,
        endpoint: input.endpoint,
        agent: agent.address,
      };
      const uri = "data:application/json," + encodeURIComponent(JSON.stringify(card));
      return ok("Agent card", { card, uri });
    } catch (e) {
      return fail(`build_agent_card failed: ${errorMessage(e)}`);
    }
  },
};
