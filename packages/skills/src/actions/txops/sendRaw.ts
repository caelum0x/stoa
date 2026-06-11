import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const sendRawSchema = z.object({
  to: addressSchema.describe("Recipient address."),
  value: decimalAmountSchema.optional().describe("Native PHRS amount in human units."),
  data: z
    .string()
    .regex(/^0x[a-fA-F0-9]*$/, "Must be 0x-prefixed hex calldata")
    .transform((v) => v as `0x${string}`)
    .optional()
    .describe("Optional 0x-prefixed calldata."),
});

/// SKILL: send_raw_tx — send a raw native transaction on Pharos.
export const sendRawAction: Action<typeof sendRawSchema> = {
  name: "SEND_RAW_TX",
  similes: ["send transaction", "send raw tx", "send phrs", "raw call"],
  description: "Send a raw native PHRS transaction with optional value and calldata, then wait for the receipt.",
  examples: [
    {
      input: { to: "0xabc", value: "1" },
      output: ok("Transaction sent", { txHash: "0x..." }),
      explanation: "Sends 1 PHRS to a recipient.",
    },
  ],
  schema: sendRawSchema,
  handler: async (agent, input) => {
    try {
      const hash = await agent.walletClient.sendTransaction({
        to: input.to,
        value: input.value !== undefined ? parseEther(input.value) : undefined,
        data: input.data,
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Transaction sent", { to: input.to, value: input.value, txHash: hash });
    } catch (e) {
      return fail(`send_raw_tx failed: ${errorMessage(e)}`);
    }
  },
};
