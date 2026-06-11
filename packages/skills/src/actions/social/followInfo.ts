import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { socialFeedAbi } from "../../abi/socialFeed.js";
import { addressSchema } from "../../schemas.js";

export const socialFollowInfoSchema = z.object({
  address: addressSchema.optional().describe("Account to inspect. Defaults to the agent."),
});

/// SKILL: social_follow_info — follower and following counts for an account.
export const socialFollowInfoAction: Action<typeof socialFollowInfoSchema> = {
  name: "SOCIAL_FOLLOW_INFO",
  similes: ["follow info", "follower count", "following count", "social stats"],
  description: "Return the follower and following counts for an account on the Pharos social feed.",
  examples: [
    {
      input: { address: "0xabc" },
      output: ok("Follow info", { followerCount: 5, followingCount: 2 }),
      explanation: "Reads follow counts for the account.",
    },
  ],
  schema: socialFollowInfoSchema,
  handler: async (agent, input) => {
    try {
      const feed = agent.requireContract("social");
      const account = input.address ?? agent.address;
      const [followers, following] = await Promise.all([
        agent.publicClient.readContract({
          address: feed,
          abi: socialFeedAbi,
          functionName: "followerCount",
          args: [account],
        }),
        agent.publicClient.readContract({
          address: feed,
          abi: socialFeedAbi,
          functionName: "followingCount",
          args: [account],
        }),
      ]);
      return ok("Follow info", {
        address: account,
        followerCount: Number(followers),
        followingCount: Number(following),
      });
    } catch (e) {
      return fail(`social_follow_info failed: ${errorMessage(e)}`);
    }
  },
};
