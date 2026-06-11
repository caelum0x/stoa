import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { streamingAbi } from "../../abi/streaming.js";

export const streamWithdrawableSchema = z.object({
  streamId: z.coerce.number().int().nonnegative().describe("Stream id to query."),
});

/// SKILL: stream_withdrawable — currently withdrawable and total streamed amounts.
export const streamWithdrawableAction: Action<typeof streamWithdrawableSchema> = {
  name: "STREAM_WITHDRAWABLE",
  similes: ["withdrawable amount", "streamed amount", "claimable stream", "how much vested"],
  description: "Read the currently withdrawable and total streamed PHRS amounts for a payment stream on Pharos.",
  examples: [
    {
      input: { streamId: 1 },
      output: ok("Stream amounts", { withdrawable: "2.5", streamed: "5.0" }),
      explanation: "2.5 PHRS withdrawable, 5.0 PHRS streamed so far.",
    },
  ],
  schema: streamWithdrawableSchema,
  handler: async (agent, input) => {
    try {
      const streaming = agent.requireContract("streaming");
      const [withdrawable, streamed] = await Promise.all([
        agent.publicClient.readContract({
          address: streaming,
          abi: streamingAbi,
          functionName: "withdrawable",
          args: [BigInt(input.streamId)],
        }),
        agent.publicClient.readContract({
          address: streaming,
          abi: streamingAbi,
          functionName: "streamedAmount",
          args: [BigInt(input.streamId)],
        }),
      ]);
      return ok("Stream amounts", {
        streamId: input.streamId,
        withdrawable: formatEther(withdrawable),
        streamed: formatEther(streamed),
      });
    } catch (e) {
      return fail(`stream_withdrawable failed: ${errorMessage(e)}`);
    }
  },
};
