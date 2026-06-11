import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const erc721EnumAbi = [
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const erc721TotalSupplySchema = z.object({
  token: addressSchema.describe("ERC-721 Enumerable contract address."),
});

/// SKILL: erc721_total_supply — total number of tokens minted in an enumerable ERC-721.
export const erc721TotalSupplyAction: Action<typeof erc721TotalSupplySchema> = {
  name: "ERC721_TOTAL_SUPPLY",
  similes: ["nft total supply", "erc721 total supply", "how many nfts", "collection size"],
  description: "Return the total supply of an ERC-721 Enumerable collection on Pharos.",
  examples: [
    {
      input: { token: "0xNft" },
      output: ok("Total supply", { totalSupply: "10000" }),
      explanation: "Reads the collection's total minted count.",
    },
  ],
  schema: erc721TotalSupplySchema,
  handler: async (agent, input) => {
    try {
      const total = await agent.publicClient.readContract({
        address: input.token,
        abi: erc721EnumAbi,
        functionName: "totalSupply",
      });
      return ok("Total supply", {
        token: input.token,
        totalSupply: total.toString(),
      });
    } catch (e) {
      return fail(`erc721_total_supply failed: ${errorMessage(e)}`);
    }
  },
};
