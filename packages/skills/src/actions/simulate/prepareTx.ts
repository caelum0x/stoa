import { z } from "zod";
import { parseEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const prepareTxSchema = z.object({
  to: addressSchema.describe("Recipient address."),
  value: decimalAmountSchema.optional().describe("Optional PHRS value in decimal units."),
});

/// SKILL: prepare_tx — prepare a transaction request and report its fee/nonce fields.
export const prepareTxAction: Action<typeof prepareTxSchema> = {
  name: "PREPARE_TX",
  similes: ["prepare transaction", "prepare tx", "build tx", "tx preview", "fill tx"],
  description: "Prepare a transaction request on Pharos and return its gas, fee, and nonce fields.",
  examples: [
    {
      input: { to: "0x0000000000000000000000000000000000000000", value: "0.1" },
      output: ok("Prepared transaction", { nonce: 0 }),
      explanation: "Prepares a transfer and reports gas/fee/nonce.",
    },
  ],
  schema: prepareTxSchema,
  handler: async (agent, input) => {
    try {
      const request = await agent.publicClient.prepareTransactionRequest({
        account: agent.account,
        to: input.to,
        ...(input.value === undefined ? {} : { value: parseEther(input.value) }),
      });
      return ok("Prepared transaction", {
        gas: request.gas?.toString() ?? null,
        maxFeePerGas: request.maxFeePerGas?.toString() ?? null,
        maxPriorityFeePerGas: request.maxPriorityFeePerGas?.toString() ?? null,
        nonce: request.nonce ?? null,
      });
    } catch (e) {
      return fail(`prepare_tx failed: ${errorMessage(e)}`);
    }
  },
};
