import { z } from "zod";
import { parseEther, formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const txFeeEstimateSchema = z.object({
  to: addressSchema.describe("Recipient address of the transaction."),
  value: decimalAmountSchema
    .optional()
    .describe("Amount of native PHRS to send, as a decimal string (e.g. \"1.5\")."),
});

/// SKILL: tx_fee_estimate — estimated total fee (gas * gasPrice) for a transfer, in PHRS.
export const txFeeEstimateAction: Action<typeof txFeeEstimateSchema> = {
  name: "TX_FEE_ESTIMATE",
  similes: ["transaction fee", "estimate tx fee", "transfer cost", "gas cost"],
  description:
    "Estimate the total fee for a native PHRS transfer by multiplying estimated gas by the gas price; returns the fee in PHRS.",
  examples: [
    {
      input: { to: "0x0000000000000000000000000000000000000000", value: "1.0" },
      output: ok("Estimated fee", { feePhrs: "0.000021" }),
      explanation: "Estimates the fee for sending 1 PHRS.",
    },
  ],
  schema: txFeeEstimateSchema,
  handler: async (agent, input) => {
    try {
      const value = input.value === undefined ? undefined : parseEther(input.value);
      const gas = await agent.publicClient.estimateGas({
        account: agent.account,
        to: input.to,
        ...(value === undefined ? {} : { value }),
      });
      const gasPrice = await agent.publicClient.getGasPrice();
      const fee = gas * gasPrice;
      return ok("Estimated fee", {
        gas: gas.toString(),
        gasPrice: gasPrice.toString(),
        feeWei: fee.toString(),
        feePhrs: formatEther(fee),
      });
    } catch (e) {
      return fail(`tx_fee_estimate failed: ${errorMessage(e)}`);
    }
  },
};
