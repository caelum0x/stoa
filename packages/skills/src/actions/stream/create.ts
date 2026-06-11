import { z } from "zod";
import { parseEther, parseEventLogs } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { streamingAbi } from "../../abi/streaming.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const streamCreateSchema = z.object({
  recipient: addressSchema.describe("Stream recipient address."),
  amount: decimalAmountSchema.describe("Total amount to stream, in PHRS."),
  start: z.coerce.number().int().nonnegative().describe("Unix start timestamp."),
  stop: z.coerce.number().int().nonnegative().describe("Unix stop timestamp."),
});

/// SKILL: stream_create — open a native PHRS payment stream to a recipient.
export const streamCreateAction: Action<typeof streamCreateSchema> = {
  name: "STREAM_CREATE",
  similes: ["create stream", "open payment stream", "stream phrs", "start streaming"],
  description: "Create a native PHRS payment stream that linearly vests from start to stop on Pharos.",
  examples: [
    {
      input: { recipient: "0xabc", amount: "10", start: 1700000000, stop: 1700086400 },
      output: ok("Stream created", { streamId: "1", txHash: "0x..." }),
      explanation: "Streams 10 PHRS over one day.",
    },
  ],
  schema: streamCreateSchema,
  handler: async (agent, input) => {
    try {
      const streaming = agent.requireContract("streaming");
      const value = parseEther(input.amount);
      const hash = await agent.walletClient.writeContract({
        address: streaming,
        abi: streamingAbi,
        functionName: "createStream",
        args: [input.recipient, BigInt(input.start), BigInt(input.stop)],
        value,
      });
      const receipt = await agent.publicClient.waitForTransactionReceipt({ hash });
      const events = parseEventLogs({ abi: streamingAbi, logs: receipt.logs, eventName: "StreamCreated" });
      const streamId = events[0]?.args.streamId;
      return ok("Stream created", {
        streamId: streamId !== undefined ? streamId.toString() : undefined,
        recipient: input.recipient,
        amount: input.amount,
        txHash: hash,
      });
    } catch (e) {
      return fail(`stream_create failed: ${errorMessage(e)}`);
    }
  },
};
