import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc721Abi } from "../../abi/erc721.js";
import { addressSchema } from "../../schemas.js";

export const erc721BalanceSchema = z.object({
  token: addressSchema.describe("ERC-721 contract address."),
  owner: addressSchema.optional().describe("Owner address. Defaults to the agent."),
});

/// SKILL: erc721_balance — number of NFTs an owner holds in a collection.
export const erc721BalanceAction: Action<typeof erc721BalanceSchema> = {
  name: "ERC721_BALANCE",
  similes: ["nft balance", "how many nfts", "erc721 balance", "nft count"],
  description: "Return the number of ERC-721 tokens an owner holds in a collection on Pharos.",
  examples: [
    {
      input: { token: "0xNFT" },
      output: ok("NFT balance", { count: "3" }),
      explanation: "Reads balanceOf for the agent.",
    },
  ],
  schema: erc721BalanceSchema,
  handler: async (agent, input) => {
    try {
      const owner = input.owner ?? agent.address;
      const count = await agent.publicClient.readContract({
        address: input.token,
        abi: erc721Abi,
        functionName: "balanceOf",
        args: [owner],
      });
      return ok("NFT balance", { token: input.token, owner, count: count.toString() });
    } catch (e) {
      return fail(`erc721_balance failed: ${errorMessage(e)}`);
    }
  },
};
