import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const waitForTxSchema = z.object({
  hash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Must be a 0x-prefixed 32-byte transaction hash")
    .transform((v) => v as `0x${string}`)
    .describe("Transaction hash to wait for."),
});

/// SKILL: wait_for_tx — wait for a transaction receipt on Pharos.
export const waitForTxAction: Action<typeof waitForTxSchema> = {
  name: "WAIT_FOR_TX",
  similes: ["wait for tx", "await receipt", "confirm transaction", "tx receipt"],
  description: "Wait for a transaction receipt on Pharos and return its status, block, and gas used.",
  examples: [
    {
      input: { hash: "0xabc" },
      output: ok("Receipt", { status: "success", blockNumber: "123456", gasUsed: "21000" }),
      explanation: "Waits for confirmation of a transaction.",
    },
  ],
  schema: waitForTxSchema,
  handler: async (agent, input) => {
    try {
      const receipt = await agent.publicClient.waitForTransactionReceipt({ hash: input.hash });
      return ok("Receipt", {
        hash: input.hash,
        status: receipt.status,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
      });
    } catch (e) {
      return fail(`wait_for_tx failed: ${errorMessage(e)}`);
    }
  },
};
