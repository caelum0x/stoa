import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { socialFeedAbi } from "../../abi/socialFeed.js";

export const socialLikeSchema = z.object({
  postId: z.coerce.number().int().nonnegative().describe("Id of the post to like."),
});

/// SKILL: social_like — like a post on the social feed.
export const socialLikeAction: Action<typeof socialLikeSchema> = {
  name: "SOCIAL_LIKE",
  similes: ["like", "like post", "upvote", "favorite post"],
  description: "Like a post on the Pharos social feed.",
  examples: [
    {
      input: { postId: 1 },
      output: ok("Post liked", { txHash: "0x..." }),
      explanation: "Likes post 1.",
    },
  ],
  schema: socialLikeSchema,
  handler: async (agent, input) => {
    try {
      const feed = agent.requireContract("social");
      const hash = await agent.walletClient.writeContract({
        address: feed,
        abi: socialFeedAbi,
        functionName: "like",
        args: [BigInt(input.postId)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Post liked", { postId: input.postId, txHash: hash });
    } catch (e) {
      return fail(`social_like failed: ${errorMessage(e)}`);
    }
  },
};
