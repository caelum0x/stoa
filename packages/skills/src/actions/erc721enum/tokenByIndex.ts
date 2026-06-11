import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const erc721EnumAbi = [
  {
    type: "function",
    name: "tokenByIndex",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const tokenByIndexSchema = z.object({
  token: addressSchema.describe("ERC-721 Enumerable contract address."),
  index: z.number().int().nonnegative().describe("Global enumeration index (0-based)."),
});

/// SKILL: token_by_index — resolve the token id at a global enumeration index.
export const tokenByIndexAction: Action<typeof tokenByIndexSchema> = {
  name: "TOKEN_BY_INDEX",
  similes: ["token by index", "nft at index", "enumerate nft", "token id at position"],
  description: "Return the token id at a global index of an ERC-721 Enumerable collection.",
  examples: [
    {
      input: { token: "0xNft", index: 0 },
      output: ok("Token by index", { tokenId: "42" }),
      explanation: "Reads the token id at global index 0.",
    },
  ],
  schema: tokenByIndexSchema,
  handler: async (agent, input) => {
    try {
      const tokenId = await agent.publicClient.readContract({
        address: input.token,
        abi: erc721EnumAbi,
        functionName: "tokenByIndex",
        args: [BigInt(input.index)],
      });
      return ok("Token by index", {
        token: input.token,
        index: input.index,
        tokenId: tokenId.toString(),
      });
    } catch (e) {
      return fail(`token_by_index failed: ${errorMessage(e)}`);
    }
  },
};
