import { z } from "zod";
import { parseEventLogs } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { socialFeedAbi } from "../../abi/socialFeed.js";

export const socialPostSchema = z.object({
  contentURI: z.string().min(1).describe("Content URI or text for the post."),
});

/// SKILL: social_post — publish a new post to the on-chain social feed.
export const socialPostAction: Action<typeof socialPostSchema> = {
  name: "SOCIAL_POST",
  similes: ["post", "publish post", "create post", "new post"],
  description: "Publish a new post to the Pharos social feed and return its post id.",
  examples: [
    {
      input: { contentURI: "ipfs://Qm..." },
      output: ok("Post published", { postId: "1", txHash: "0x..." }),
      explanation: "Creates a new top-level post.",
    },
  ],
  schema: socialPostSchema,
  handler: async (agent, input) => {
    try {
      const feed = agent.requireContract("social");
      const hash = await agent.walletClient.writeContract({
        address: feed,
        abi: socialFeedAbi,
        functionName: "post",
        args: [input.contentURI],
      });
      const receipt = await agent.publicClient.waitForTransactionReceipt({ hash });
      const events = parseEventLogs({ abi: socialFeedAbi, logs: receipt.logs, eventName: "Posted" });
      const postId = events[0]?.args.postId;
      return ok("Post published", {
        postId: postId !== undefined ? postId.toString() : undefined,
        txHash: hash,
      });
    } catch (e) {
      return fail(`social_post failed: ${errorMessage(e)}`);
    }
  },
};
