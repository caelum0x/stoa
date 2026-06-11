import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { socialFeedAbi } from "../../abi/socialFeed.js";
import { addressSchema } from "../../schemas.js";

export const socialPostsByAuthorSchema = z.object({
  author: addressSchema.optional().describe("Author address. Defaults to the agent."),
});

/// SKILL: social_posts_by_author — list post ids authored by an account.
export const socialPostsByAuthorAction: Action<typeof socialPostsByAuthorSchema> = {
  name: "SOCIAL_POSTS_BY_AUTHOR",
  similes: ["posts by author", "user posts", "my posts", "list posts"],
  description: "List the post ids authored by an account on the Pharos social feed.",
  examples: [
    {
      input: { author: "0xabc" },
      output: ok("Posts by author", { postIds: ["1", "2"] }),
      explanation: "Lists the author's post ids.",
    },
  ],
  schema: socialPostsByAuthorSchema,
  handler: async (agent, input) => {
    try {
      const feed = agent.requireContract("social");
      const author = input.author ?? agent.address;
      const ids = await agent.publicClient.readContract({
        address: feed,
        abi: socialFeedAbi,
        functionName: "postsByAuthor",
        args: [author],
      });
      return ok("Posts by author", {
        author,
        postIds: ids.map((id) => id.toString()),
      });
    } catch (e) {
      return fail(`social_posts_by_author failed: ${errorMessage(e)}`);
    }
  },
};
