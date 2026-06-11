import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const signTypedDataSchema = z.object({
  domain: z.string().describe("EIP-712 domain as a JSON string."),
  types: z.string().describe("EIP-712 types as a JSON string."),
  primaryType: z.string().describe("Primary type name from the types object."),
  message: z.string().describe("Message to sign as a JSON string."),
});

/// SKILL: sign_typed_data — sign an EIP-712 typed-data payload with the agent wallet.
export const signTypedDataAction: Action<typeof signTypedDataSchema> = {
  name: "SIGN_TYPED_DATA",
  similes: ["sign eip712", "sign typed data", "eip-712 signature", "sign permit"],
  description: "Sign an EIP-712 typed-data payload with the agent's wallet and return the signature.",
  examples: [
    {
      input: {
        domain: '{"name":"Stoa","version":"1","chainId":1}',
        types: '{"Mail":[{"name":"contents","type":"string"}]}',
        primaryType: "Mail",
        message: '{"contents":"hello"}',
      },
      output: ok("Typed data signed", { signature: "0x..." }),
      explanation: "Signs the structured message.",
    },
  ],
  schema: signTypedDataSchema,
  handler: async (agent, input) => {
    try {
      const domain = JSON.parse(input.domain);
      const types = JSON.parse(input.types);
      const message = JSON.parse(input.message);
      const signature = await agent.walletClient.signTypedData({
        account: agent.account,
        domain,
        types,
        primaryType: input.primaryType,
        message,
      });
      return ok("Typed data signed", { primaryType: input.primaryType, signature });
    } catch (e) {
      return fail(`sign_typed_data failed: ${errorMessage(e)}`);
    }
  },
};
