import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { socialFeedAbi } from "../../abi/socialFeed.js";

export const socialGetPostSchema = z.object({
  postId: z.coerce.number().int().nonnegative().describe("Id of the post to read."),
});

/// SKILL: social_get_post — read a single post from the social feed.
export const socialGetPostAction: Action<typeof socialGetPostSchema> = {
  name: "SOCIAL_GET_POST",
  similes: ["get post", "read post", "view post", "fetch post"],
  description: "Read a single post from the Pharos social feed by its id.",
  examples: [
    {
      input: { postId: 1 },
      output: ok("Post read", { author: "0xabc", contentURI: "ipfs://Qm...", likes: 3 }),
      explanation: "Reads post 1.",
    },
  ],
  schema: socialGetPostSchema,
  handler: async (agent, input) => {
    try {
      const feed = agent.requireContract("social");
      const post = await agent.publicClient.readContract({
        address: feed,
        abi: socialFeedAbi,
        functionName: "getPost",
        args: [BigInt(input.postId)],
      });
      return ok("Post read", {
        postId: input.postId,
        author: post.author,
        parentId: post.parentId.toString(),
        contentURI: post.contentURI,
        createdAt: Number(post.createdAt),
        likes: Number(post.likes),
      });
    } catch (e) {
      return fail(`social_get_post failed: ${errorMessage(e)}`);
    }
  },
};
