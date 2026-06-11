import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const getBytecodeSchema = z.object({
  address: addressSchema.describe("Address to fetch deployed bytecode for."),
});

/// SKILL: get_bytecode — deployed runtime bytecode at an address.
export const getBytecodeAction: Action<typeof getBytecodeSchema> = {
  name: "GET_BYTECODE",
  similes: ["get bytecode", "contract code", "deployed code", "read bytecode"],
  description: "Return the deployed runtime bytecode at an address on Pharos, plus its hex length.",
  examples: [
    {
      input: { address: "0xContract" },
      output: ok("Bytecode", { code: "0x6080...", length: 6 }),
      explanation: "Reads the runtime bytecode of a deployed contract.",
    },
  ],
  schema: getBytecodeSchema,
  handler: async (agent, input) => {
    try {
      const code = (await agent.publicClient.getCode({ address: input.address })) ?? "0x";
      return ok("Bytecode", {
        address: input.address,
        code,
        length: code.length,
      });
    } catch (e) {
      return fail(`get_bytecode failed: ${errorMessage(e)}`);
    }
  },
};
