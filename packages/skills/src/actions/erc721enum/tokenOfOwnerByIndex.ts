import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const erc721EnumAbi = [
  {
    type: "function",
    name: "tokenOfOwnerByIndex",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const tokenOfOwnerByIndexSchema = z.object({
  token: addressSchema.describe("ERC-721 Enumerable contract address."),
  owner: addressSchema.optional().describe("Owner address. Defaults to the agent."),
  index: z.number().int().nonnegative().describe("Per-owner enumeration index (0-based)."),
});

/// SKILL: token_of_owner_by_index — resolve a token id owned by an account at an index.
export const tokenOfOwnerByIndexAction: Action<typeof tokenOfOwnerByIndexSchema> = {
  name: "TOKEN_OF_OWNER_BY_INDEX",
  similes: ["token of owner by index", "owner nft at index", "enumerate owner nfts", "nth nft of owner"],
  description: "Return the token id owned by an account at a per-owner index of an ERC-721 Enumerable collection.",
  examples: [
    {
      input: { token: "0xNft", index: 0 },
      output: ok("Token of owner by index", { tokenId: "7" }),
      explanation: "Reads the agent's first owned token id.",
    },
  ],
  schema: tokenOfOwnerByIndexSchema,
  handler: async (agent, input) => {
    try {
      const owner = input.owner ?? agent.address;
      const tokenId = await agent.publicClient.readContract({
        address: input.token,
        abi: erc721EnumAbi,
        functionName: "tokenOfOwnerByIndex",
        args: [owner, BigInt(input.index)],
      });
      return ok("Token of owner by index", {
        token: input.token,
        owner,
        index: input.index,
        tokenId: tokenId.toString(),
      });
    } catch (e) {
      return fail(`token_of_owner_by_index failed: ${errorMessage(e)}`);
    }
  },
};
