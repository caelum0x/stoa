import { z } from "zod";
import { keccak256, stringToHex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const eventTopicSchema = z.object({
  signature: z.string().describe('Event signature, e.g. "Transfer(address,address,uint256)".'),
});

/// SKILL: EVENT_TOPIC — topic0 hash from an event signature (no network).
export const eventTopicAction: Action<typeof eventTopicSchema> = {
  name: "EVENT_TOPIC",
  similes: ["event topic", "topic0", "event signature hash", "log topic"],
  description: "Compute the topic0 (keccak256) hash for a Solidity event signature.",
  examples: [
    {
      input: { signature: "Transfer(address,address,uint256)" },
      output: ok("Topic", { topic: "0xddf252ad..." }),
      explanation: "topic0 for ERC-20 Transfer.",
    },
  ],
  schema: eventTopicSchema,
  handler: async (_agent, input) => {
    try {
      const topic = keccak256(stringToHex(input.signature));
      return ok("Topic", { signature: input.signature, topic });
    } catch (e) {
      return fail(`EVENT_TOPIC failed: ${errorMessage(e)}`);
    }
  },
};
