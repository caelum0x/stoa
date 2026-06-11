import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const isContractSchema = z.object({
  address: addressSchema.describe("Address to inspect."),
});

/// SKILL: is_contract — whether an address has deployed bytecode.
export const isContractAction: Action<typeof isContractSchema> = {
  name: "IS_CONTRACT",
  similes: ["is contract", "has code", "eoa or contract", "contract check"],
  description: "Return whether an address is a contract (has bytecode) or an EOA on Pharos.",
  examples: [
    {
      input: { address: "0xabc..." },
      output: ok("Code check", { isContract: true }),
      explanation: "Distinguishes contracts from wallets.",
    },
  ],
  schema: isContractSchema,
  handler: async (agent, input) => {
    try {
      const code = await agent.publicClient.getCode({ address: input.address });
      const isContract = Boolean(code && code !== "0x");
      return ok("Code check", { address: input.address, isContract, codeSize: code ? (code.length - 2) / 2 : 0 });
    } catch (e) {
      return fail(`is_contract failed: ${errorMessage(e)}`);
    }
  },
};
