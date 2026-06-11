import { z } from "zod";
import { formatGwei } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const gasPriceSchema = z.object({});

/// SKILL: get_gas_price — current gas price on Pharos.
export const gasPriceAction: Action<typeof gasPriceSchema> = {
  name: "GET_GAS_PRICE",
  similes: ["gas price", "current gas", "network fee", "gwei"],
  description: "Return the current gas price on the connected Pharos network, in wei and gwei.",
  examples: [
    { input: {}, output: ok("Gas price", { gwei: "1.0" }), explanation: "Reads current gas price." },
  ],
  schema: gasPriceSchema,
  handler: async (agent) => {
    try {
      const wei = await agent.publicClient.getGasPrice();
      return ok("Gas price", { wei: wei.toString(), gwei: formatGwei(wei) });
    } catch (e) {
      return fail(`get_gas_price failed: ${errorMessage(e)}`);
    }
  },
};
