import { z } from "zod";
import { recoverTypedDataAddress, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const recoverTypedDataSchema = z.object({
  domain: z.string().describe("EIP-712 domain as a JSON string."),
  types: z.string().describe("EIP-712 types as a JSON string."),
  primaryType: z.string().describe("Primary type name from the types definition."),
  message: z.string().describe("Typed-data message as a JSON string."),
  signature: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, "Must be a 0x-prefixed signature")
    .describe("0x-prefixed hex signature."),
});

/// SKILL: recover_typed_data_address — recover the signer address from an EIP-712 signature.
export const recoverTypedDataAction: Action<typeof recoverTypedDataSchema> = {
  name: "RECOVER_TYPED_DATA_ADDRESS",
  similes: ["recover typed data", "eip712 signer", "recover 712 address", "typed data signer"],
  description: "Recover the signer address from an EIP-712 typed-data signature.",
  examples: [
    {
      input: {
        domain: "{}",
        types: '{"Mail":[{"name":"to","type":"address"}]}',
        primaryType: "Mail",
        message: '{"to":"0x0000000000000000000000000000000000000000"}',
        signature: "0x" + "ab".repeat(65),
      },
      output: ok("Signer", { address: "0x..." }),
      explanation: "Recovers the address that signed the typed data.",
    },
  ],
  schema: recoverTypedDataSchema,
  handler: async (_agent, input) => {
    try {
      const address = await recoverTypedDataAddress({
        domain: JSON.parse(input.domain),
        types: JSON.parse(input.types),
        primaryType: input.primaryType,
        message: JSON.parse(input.message),
        signature: input.signature as Hex,
      });
      return ok("Signer", { address });
    } catch (e) {
      return fail(`recover_typed_data_address failed: ${errorMessage(e)}`);
    }
  },
};
