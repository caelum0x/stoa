import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, baseUnitsSchema } from "../../schemas.js";

export const buildPermitTypedDataSchema = z.object({
  token: addressSchema.describe("ERC-2612 token contract address (the verifying contract)."),
  tokenName: z.string().min(1).describe("EIP-712 domain name, i.e. the token's name()."),
  spender: addressSchema.describe("Address being granted the allowance."),
  value: baseUnitsSchema.describe("Permitted allowance in base units, as a string."),
  nonce: baseUnitsSchema.describe("Current permit nonce for the owner, as a string."),
  deadline: baseUnitsSchema.describe("Unix timestamp after which the permit is invalid, as a string."),
  version: z.string().min(1).default("1").describe('EIP-712 domain version. Defaults to "1".'),
});

/// SKILL: build_permit_typed_data — assemble EIP-712 typed data for an ERC-2612 Permit.
export const buildPermitTypedDataAction: Action<typeof buildPermitTypedDataSchema> = {
  name: "BUILD_PERMIT_TYPED_DATA",
  similes: ["eip2612 permit", "build permit", "permit typed data", "erc20 permit signature payload"],
  description:
    "Build the EIP-712 typed data object for an ERC-2612 Permit. Owner is the agent. Pure: no network access.",
  examples: [
    {
      input: {
        token: "0xToken",
        tokenName: "USD Coin",
        spender: "0xSpender",
        value: "1000000",
        nonce: "0",
        deadline: "1900000000",
      },
      output: ok("Permit typed data", { primaryType: "Permit" }),
      explanation: "Produces the typed data the owner signs to grant a gasless allowance.",
    },
  ],
  schema: buildPermitTypedDataSchema,
  handler: async (agent, input) => {
    try {
      const typedData = {
        domain: {
          name: input.tokenName,
          version: input.version,
          chainId: agent.chain.id,
          verifyingContract: input.token,
        },
        types: {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Permit" as const,
        message: {
          owner: agent.address,
          spender: input.spender,
          value: input.value,
          nonce: input.nonce,
          deadline: input.deadline,
        },
      };
      return ok("Permit typed data", { owner: agent.address, typedData });
    } catch (e) {
      return fail(`build_permit_typed_data failed: ${errorMessage(e)}`);
    }
  },
};
