import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { socialFeedAbi } from "../../abi/socialFeed.js";
import { addressSchema } from "../../schemas.js";

export const socialUnfollowSchema = z.object({
  followee: addressSchema.describe("Address of the account to unfollow."),
});

/// SKILL: social_unfollow — unfollow an account on the social feed.
export const socialUnfollowAction: Action<typeof socialUnfollowSchema> = {
  name: "SOCIAL_UNFOLLOW",
  similes: ["unfollow", "unfollow user", "unsubscribe", "stop following"],
  description: "Unfollow an account on the Pharos social feed.",
  examples: [
    {
      input: { followee: "0xabc" },
      output: ok("Unfollowed", { txHash: "0x..." }),
      explanation: "Unfollows the given address.",
    },
  ],
  schema: socialUnfollowSchema,
  handler: async (agent, input) => {
    try {
      const feed = agent.requireContract("social");
      const hash = await agent.walletClient.writeContract({
        address: feed,
        abi: socialFeedAbi,
        functionName: "unfollow",
        args: [input.followee],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Unfollowed", { followee: input.followee, txHash: hash });
    } catch (e) {
      return fail(`social_unfollow failed: ${errorMessage(e)}`);
    }
  },
};
