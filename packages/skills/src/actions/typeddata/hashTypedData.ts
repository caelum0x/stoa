import { z } from "zod";
import { hashTypedData } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const hashTypedDataSchema = z.object({
  domain: z.string().describe("EIP-712 domain as a JSON string."),
  types: z.string().describe("EIP-712 types as a JSON string."),
  primaryType: z.string().describe("Primary type name from the types object."),
  message: z.string().describe("Message to hash as a JSON string."),
});

/// SKILL: hash_typed_data — compute the EIP-712 hash of a typed-data payload.
export const hashTypedDataAction: Action<typeof hashTypedDataSchema> = {
  name: "HASH_TYPED_DATA",
  similes: ["eip712 hash", "hash typed data", "eip-712 digest", "typed data hash"],
  description: "Compute the EIP-712 struct hash (digest) of a typed-data payload without signing.",
  examples: [
    {
      input: {
        domain: '{"name":"Stoa","version":"1","chainId":1}',
        types: '{"Mail":[{"name":"contents","type":"string"}]}',
        primaryType: "Mail",
        message: '{"contents":"hello"}',
      },
      output: ok("Typed data hashed", { hash: "0x..." }),
      explanation: "Hashes the structured message.",
    },
  ],
  schema: hashTypedDataSchema,
  handler: async (_agent, input) => {
    try {
      const domain = JSON.parse(input.domain);
      const types = JSON.parse(input.types);
      const message = JSON.parse(input.message);
      const hash = hashTypedData({
        domain,
        types,
        primaryType: input.primaryType,
        message,
      });
      return ok("Typed data hashed", { primaryType: input.primaryType, hash });
    } catch (e) {
      return fail(`hash_typed_data failed: ${errorMessage(e)}`);
    }
  },
};
