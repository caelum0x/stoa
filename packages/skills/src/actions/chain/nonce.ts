import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const nonceSchema = z.object({
  address: addressSchema.optional().describe("Address to query. Defaults to the agent's address."),
});

/// SKILL: get_nonce — transaction count (nonce) of an address.
export const nonceAction: Action<typeof nonceSchema> = {
  name: "GET_NONCE",
  similes: ["transaction count", "nonce", "account nonce"],
  description: "Return the transaction count (nonce) for an address on Pharos.",
  examples: [{ input: {}, output: ok("Nonce", { nonce: 12 }), explanation: "Reads the agent's nonce." }],
  schema: nonceSchema,
  handler: async (agent, input) => {
    try {
      const address = input.address ?? agent.address;
      const nonce = await agent.publicClient.getTransactionCount({ address });
      return ok("Nonce", { address, nonce });
    } catch (e) {
      return fail(`get_nonce failed: ${errorMessage(e)}`);
    }
  },
};
