import { z } from "zod";
import { formatGwei } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const baseFeeSchema = z.object({});

/// SKILL: base_fee — base fee per gas of the latest block.
export const baseFeeAction: Action<typeof baseFeeSchema> = {
  name: "BASE_FEE",
  similes: ["base fee", "base fee per gas", "block base fee", "eip1559 base fee"],
  description:
    "Return the base fee per gas of the latest Pharos block, in wei and gwei (or null if unavailable).",
  examples: [
    {
      input: {},
      output: ok("Base fee", { gwei: "1.0" }),
      explanation: "Reads the base fee per gas from the latest block.",
    },
  ],
  schema: baseFeeSchema,
  handler: async (agent) => {
    try {
      const block = await agent.publicClient.getBlock();
      const baseFee = block.baseFeePerGas;
      return ok("Base fee", {
        wei: baseFee === null ? null : baseFee.toString(),
        gwei: baseFee === null ? null : formatGwei(baseFee),
      });
    } catch (e) {
      return fail(`base_fee failed: ${errorMessage(e)}`);
    }
  },
};
