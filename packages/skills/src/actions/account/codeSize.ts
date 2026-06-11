import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const getCodeSizeSchema = z.object({
  address: addressSchema.describe("Address to measure deployed bytecode size for."),
});

/// SKILL: get_code_size — byte size of deployed bytecode at an address.
export const getCodeSizeAction: Action<typeof getCodeSizeSchema> = {
  name: "GET_CODE_SIZE",
  similes: ["code size", "bytecode size", "contract size", "how big is the contract"],
  description: "Return the size in bytes of the deployed bytecode at an address on Pharos.",
  examples: [
    {
      input: { address: "0xContract" },
      output: ok("Code size", { size: 2 }),
      explanation: "Computes the byte size of a deployed contract's bytecode.",
    },
  ],
  schema: getCodeSizeSchema,
  handler: async (agent, input) => {
    try {
      const code = (await agent.publicClient.getCode({ address: input.address })) ?? "0x";
      const size = code.length > 2 ? (code.length - 2) / 2 : 0;
      return ok("Code size", {
        address: input.address,
        size,
      });
    } catch (e) {
      return fail(`get_code_size failed: ${errorMessage(e)}`);
    }
  },
};
