import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { socialFeedAbi } from "../../abi/socialFeed.js";
import { addressSchema } from "../../schemas.js";

export const socialFollowSchema = z.object({
  followee: addressSchema.describe("Address of the account to follow."),
});

/// SKILL: social_follow — follow another account on the social feed.
export const socialFollowAction: Action<typeof socialFollowSchema> = {
  name: "SOCIAL_FOLLOW",
  similes: ["follow", "follow user", "subscribe", "follow account"],
  description: "Follow another account on the Pharos social feed.",
  examples: [
    {
      input: { followee: "0xabc" },
      output: ok("Followed", { txHash: "0x..." }),
      explanation: "Follows the given address.",
    },
  ],
  schema: socialFollowSchema,
  handler: async (agent, input) => {
    try {
      const feed = agent.requireContract("social");
      const hash = await agent.walletClient.writeContract({
        address: feed,
        abi: socialFeedAbi,
        functionName: "follow",
        args: [input.followee],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Followed", { followee: input.followee, txHash: hash });
    } catch (e) {
      return fail(`social_follow failed: ${errorMessage(e)}`);
    }
  },
};
