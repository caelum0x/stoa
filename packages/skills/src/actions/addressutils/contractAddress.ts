import { z } from "zod";
import { getContractAddress } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const contractAddressSchema = z.object({
  from: addressSchema.describe("Deployer address."),
  nonce: z.coerce.number().int().nonnegative().describe("Deployer transaction nonce."),
});

/// SKILL: compute_contract_address — predict a CREATE contract address from deployer + nonce.
export const contractAddressAction: Action<typeof contractAddressSchema> = {
  name: "COMPUTE_CONTRACT_ADDRESS",
  similes: ["create address", "predict contract address", "contract address from nonce", "deploy address"],
  description: "Compute the contract address a CREATE deployment would produce from a deployer address and nonce.",
  examples: [
    {
      input: { from: "0x0000000000000000000000000000000000000001", nonce: 0 },
      output: ok("Contract address", { address: "0x..." }),
      explanation: "Predicts the address for the first deployment from an account.",
    },
  ],
  schema: contractAddressSchema,
  handler: async (_agent, input) => {
    try {
      const address = getContractAddress({ from: input.from, nonce: BigInt(input.nonce) });
      return ok("Contract address", { from: input.from, nonce: input.nonce, address });
    } catch (e) {
      return fail(`compute_contract_address failed: ${errorMessage(e)}`);
    }
  },
};
