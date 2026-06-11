import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { streamingAbi } from "../../abi/streaming.js";

export const streamGetSchema = z.object({
  streamId: z.coerce.number().int().nonnegative().describe("Stream id to read."),
});

/// SKILL: stream_get — read the full state of a payment stream.
export const streamGetAction: Action<typeof streamGetSchema> = {
  name: "STREAM_GET",
  similes: ["get stream", "read stream", "stream info", "stream details"],
  description: "Read a payment stream's sender, recipient, token, deposit, withdrawn, window, and cancelled flag on Pharos.",
  examples: [
    {
      input: { streamId: 1 },
      output: ok("Stream read", { sender: "0x...", recipient: "0x...", deposit: "10.0" }),
      explanation: "Reads stream 1.",
    },
  ],
  schema: streamGetSchema,
  handler: async (agent, input) => {
    try {
      const streaming = agent.requireContract("streaming");
      const stream = await agent.publicClient.readContract({
        address: streaming,
        abi: streamingAbi,
        functionName: "getStream",
        args: [BigInt(input.streamId)],
      });
      return ok("Stream read", {
        streamId: input.streamId,
        sender: stream.sender,
        recipient: stream.recipient,
        token: stream.token,
        deposit: formatEther(stream.deposit),
        withdrawn: formatEther(stream.withdrawn),
        start: Number(stream.start),
        stop: Number(stream.stop),
        cancelled: stream.cancelled,
      });
    } catch (e) {
      return fail(`stream_get failed: ${errorMessage(e)}`);
    }
  },
};
