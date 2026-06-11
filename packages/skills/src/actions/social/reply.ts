import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { socialFeedAbi } from "../../abi/socialFeed.js";

export const socialReplySchema = z.object({
  parentId: z.coerce.number().int().nonnegative().describe("Id of the post being replied to."),
  contentURI: z.string().min(1).describe("Content URI or text for the reply."),
});

/// SKILL: social_reply — reply to an existing post on the social feed.
export const socialReplyAction: Action<typeof socialReplySchema> = {
  name: "SOCIAL_REPLY",
  similes: ["reply", "comment", "respond to post", "answer post"],
  description: "Reply to an existing post on the Pharos social feed.",
  examples: [
    {
      input: { parentId: 1, contentURI: "ipfs://Qm..." },
      output: ok("Reply posted", { txHash: "0x..." }),
      explanation: "Replies to post 1.",
    },
  ],
  schema: socialReplySchema,
  handler: async (agent, input) => {
    try {
      const feed = agent.requireContract("social");
      const hash = await agent.walletClient.writeContract({
        address: feed,
        abi: socialFeedAbi,
        functionName: "reply",
        args: [BigInt(input.parentId), input.contentURI],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Reply posted", { parentId: input.parentId, txHash: hash });
    } catch (e) {
      return fail(`social_reply failed: ${errorMessage(e)}`);
    }
  },
};
