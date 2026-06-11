import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const ERC721_INTERFACE_ID = "0x80ac58cd" as const;

const supportsInterfaceAbi = [
  {
    type: "function",
    name: "supportsInterface",
    stateMutability: "view",
    inputs: [{ name: "interfaceId", type: "bytes4" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const erc165IsErc721Schema = z.object({
  address: addressSchema.describe("Contract address to query."),
});

/// SKILL: erc165_is_erc721 — detect whether a contract is an ERC-721 collection.
export const erc165IsErc721Action: Action<typeof erc165IsErc721Schema> = {
  name: "IS_ERC721",
  similes: ["is erc721", "is nft", "erc721 check", "is nft collection"],
  description: "Detect whether a contract implements the ERC-721 interface (0x80ac58cd) via ERC-165 supportsInterface.",
  examples: [
    {
      input: { address: "0xNFT" },
      output: ok("ERC-721 detection", { isErc721: true }),
      explanation: "Checks whether the contract is an ERC-721 collection.",
    },
  ],
  schema: erc165IsErc721Schema,
  handler: async (agent, input) => {
    try {
      const isErc721 = await agent.publicClient.readContract({
        address: input.address,
        abi: supportsInterfaceAbi,
        functionName: "supportsInterface",
        args: [ERC721_INTERFACE_ID],
      });
      return ok("ERC-721 detection", {
        address: input.address,
        interfaceId: ERC721_INTERFACE_ID,
        isErc721,
      });
    } catch (e) {
      return fail(`is_erc721 failed: ${errorMessage(e)}`);
    }
  },
};
