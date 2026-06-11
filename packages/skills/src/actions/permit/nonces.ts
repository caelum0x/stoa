import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

/// Minimal inline ERC-2612 ABI: just the read methods this skill needs.
const erc2612Abi = [
  {
    type: "function",
    name: "nonces",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const erc2612NoncesSchema = z.object({
  token: addressSchema.describe("ERC-2612 token contract address."),
  owner: addressSchema.optional().describe("Owner address. Defaults to the agent."),
});

/// SKILL: erc2612_nonces — current permit nonce for an owner on an ERC-2612 token.
export const erc2612NoncesAction: Action<typeof erc2612NoncesSchema> = {
  name: "ERC2612_NONCES",
  similes: ["permit nonce", "erc2612 nonce", "permit nonces", "current nonce"],
  description: "Return the current ERC-2612 permit nonce for an owner on a token on Pharos.",
  examples: [
    {
      input: { token: "0xUSDC" },
      output: ok("Permit nonce", { nonce: "0" }),
      explanation: "Reads nonces(owner) for the agent.",
    },
  ],
  schema: erc2612NoncesSchema,
  handler: async (agent, input) => {
    try {
      const owner = input.owner ?? agent.address;
      const nonce = await agent.publicClient.readContract({
        address: input.token,
        abi: erc2612Abi,
        functionName: "nonces",
        args: [owner],
      });
      return ok("Permit nonce", { token: input.token, owner, nonce: nonce.toString() });
    } catch (e) {
      return fail(`erc2612_nonces failed: ${errorMessage(e)}`);
    }
  },
};
