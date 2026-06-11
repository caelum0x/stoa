import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const ERC1155_INTERFACE_ID = "0xd9b67a26" as const;

const supportsInterfaceAbi = [
  {
    type: "function",
    name: "supportsInterface",
    stateMutability: "view",
    inputs: [{ name: "interfaceId", type: "bytes4" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const erc165IsErc1155Schema = z.object({
  address: addressSchema.describe("Contract address to query."),
});

/// SKILL: erc165_is_erc1155 — detect whether a contract is an ERC-1155 multi-token.
export const erc165IsErc1155Action: Action<typeof erc165IsErc1155Schema> = {
  name: "IS_ERC1155",
  similes: ["is erc1155", "is multi token", "erc1155 check", "is semi fungible"],
  description: "Detect whether a contract implements the ERC-1155 interface (0xd9b67a26) via ERC-165 supportsInterface.",
  examples: [
    {
      input: { address: "0xMultiToken" },
      output: ok("ERC-1155 detection", { isErc1155: true }),
      explanation: "Checks whether the contract is an ERC-1155 multi-token.",
    },
  ],
  schema: erc165IsErc1155Schema,
  handler: async (agent, input) => {
    try {
      const isErc1155 = await agent.publicClient.readContract({
        address: input.address,
        abi: supportsInterfaceAbi,
        functionName: "supportsInterface",
        args: [ERC1155_INTERFACE_ID],
      });
      return ok("ERC-1155 detection", {
        address: input.address,
        interfaceId: ERC1155_INTERFACE_ID,
        isErc1155,
      });
    } catch (e) {
      return fail(`is_erc1155 failed: ${errorMessage(e)}`);
    }
  },
};
