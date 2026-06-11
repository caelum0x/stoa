import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { streamingAbi } from "../../abi/streaming.js";

export const streamWithdrawSchema = z.object({
  streamId: z.coerce.number().int().nonnegative().describe("Stream id."),
  amount: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Must be a non-negative decimal string, e.g. "1.5"')
    .describe("Amount to withdraw, in PHRS."),
});

/// SKILL: stream_withdraw — withdraw vested PHRS from a payment stream.
export const streamWithdrawAction: Action<typeof streamWithdrawSchema> = {
  name: "STREAM_WITHDRAW",
  similes: ["withdraw stream", "claim stream", "pull streamed funds", "collect stream"],
  description: "Withdraw an amount of vested native PHRS from an existing payment stream on Pharos.",
  examples: [
    {
      input: { streamId: 1, amount: "2.5" },
      output: ok("Stream withdrawal sent", { txHash: "0x..." }),
      explanation: "Withdraws 2.5 PHRS from stream 1.",
    },
  ],
  schema: streamWithdrawSchema,
  handler: async (agent, input) => {
    try {
      const streaming = agent.requireContract("streaming");
      const hash = await agent.walletClient.writeContract({
        address: streaming,
        abi: streamingAbi,
        functionName: "withdraw",
        args: [BigInt(input.streamId), parseEther(input.amount)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Stream withdrawal sent", {
        streamId: input.streamId,
        amount: input.amount,
        txHash: hash,
      });
    } catch (e) {
      return fail(`stream_withdraw failed: ${errorMessage(e)}`);
    }
  },
};
