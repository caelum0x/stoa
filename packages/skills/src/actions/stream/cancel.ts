import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { streamingAbi } from "../../abi/streaming.js";

export const streamCancelSchema = z.object({
  streamId: z.coerce.number().int().nonnegative().describe("Stream id to cancel."),
});

/// SKILL: stream_cancel — cancel a payment stream and settle balances.
export const streamCancelAction: Action<typeof streamCancelSchema> = {
  name: "STREAM_CANCEL",
  similes: ["cancel stream", "stop stream", "terminate stream", "end streaming"],
  description: "Cancel a native PHRS payment stream on Pharos, settling vested and unvested balances.",
  examples: [
    {
      input: { streamId: 1 },
      output: ok("Stream cancelled", { txHash: "0x..." }),
      explanation: "Cancels stream 1.",
    },
  ],
  schema: streamCancelSchema,
  handler: async (agent, input) => {
    try {
      const streaming = agent.requireContract("streaming");
      const hash = await agent.walletClient.writeContract({
        address: streaming,
        abi: streamingAbi,
        functionName: "cancel",
        args: [BigInt(input.streamId)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Stream cancelled", { streamId: input.streamId, txHash: hash });
    } catch (e) {
      return fail(`stream_cancel failed: ${errorMessage(e)}`);
    }
  },
};
