import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const isEoaSchema = z.object({
  address: addressSchema.describe("Address to classify as EOA or contract."),
});

/// SKILL: is_eoa — whether an address is an externally owned account (no code).
export const isEoaAction: Action<typeof isEoaSchema> = {
  name: "IS_EOA",
  similes: ["is eoa", "is contract", "externally owned account", "account type"],
  description: "Determine whether an address is an EOA (no deployed bytecode) or a contract on Pharos.",
  examples: [
    {
      input: { address: "0xWallet" },
      output: ok("Account type", { isEoa: true }),
      explanation: "An address with no code is an externally owned account.",
    },
  ],
  schema: isEoaSchema,
  handler: async (agent, input) => {
    try {
      const code = await agent.publicClient.getCode({ address: input.address });
      const isEoa = !code || code === "0x";
      return ok("Account type", {
        address: input.address,
        isEoa,
      });
    } catch (e) {
      return fail(`is_eoa failed: ${errorMessage(e)}`);
    }
  },
};
