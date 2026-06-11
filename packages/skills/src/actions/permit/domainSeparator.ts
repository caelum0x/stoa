import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

/// Minimal inline ERC-2612 ABI: the EIP-712 domain separator getter.
const erc2612Abi = [
  {
    type: "function",
    name: "DOMAIN_SEPARATOR",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
] as const;

export const erc2612DomainSeparatorSchema = z.object({
  token: addressSchema.describe("ERC-2612 token contract address."),
});

/// SKILL: erc2612_domain_separator — EIP-712 DOMAIN_SEPARATOR of an ERC-2612 token.
export const erc2612DomainSeparatorAction: Action<typeof erc2612DomainSeparatorSchema> = {
  name: "ERC2612_DOMAIN_SEPARATOR",
  similes: ["domain separator", "eip712 domain", "permit domain", "erc2612 domain"],
  description: "Return the EIP-712 DOMAIN_SEPARATOR for an ERC-2612 token on Pharos.",
  examples: [
    {
      input: { token: "0xUSDC" },
      output: ok("Domain separator", { domainSeparator: "0x00" }),
      explanation: "Reads DOMAIN_SEPARATOR() from the token.",
    },
  ],
  schema: erc2612DomainSeparatorSchema,
  handler: async (agent, input) => {
    try {
      const domainSeparator = await agent.publicClient.readContract({
        address: input.token,
        abi: erc2612Abi,
        functionName: "DOMAIN_SEPARATOR",
      });
      return ok("Domain separator", { token: input.token, domainSeparator });
    } catch (e) {
      return fail(`erc2612_domain_separator failed: ${errorMessage(e)}`);
    }
  },
};
