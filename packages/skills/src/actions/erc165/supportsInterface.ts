import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const supportsInterfaceAbi = [
  {
    type: "function",
    name: "supportsInterface",
    stateMutability: "view",
    inputs: [{ name: "interfaceId", type: "bytes4" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const interfaceIdSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{8}$/, "Must be a 0x-prefixed 4-byte interface id")
  .transform((v) => v as `0x${string}`);

export const erc165SupportsInterfaceSchema = z.object({
  address: addressSchema.describe("Contract address to query."),
  interfaceId: interfaceIdSchema.describe("ERC-165 interface id (0x + 4-byte hex)."),
});

/// SKILL: erc165_supports_interface — check whether a contract implements an interface.
export const erc165SupportsInterfaceAction: Action<typeof erc165SupportsInterfaceSchema> = {
  name: "SUPPORTS_INTERFACE",
  similes: ["supports interface", "erc165 check", "implements interface", "interface detection"],
  description: "Call ERC-165 supportsInterface(bytes4) on a contract and return whether it supports the given interface id.",
  examples: [
    {
      input: { address: "0xNFT", interfaceId: "0x80ac58cd" },
      output: ok("Interface support", { supported: true }),
      explanation: "Checks whether the contract supports the ERC-721 interface.",
    },
  ],
  schema: erc165SupportsInterfaceSchema,
  handler: async (agent, input) => {
    try {
      const supported = await agent.publicClient.readContract({
        address: input.address,
        abi: supportsInterfaceAbi,
        functionName: "supportsInterface",
        args: [input.interfaceId],
      });
      return ok("Interface support", {
        address: input.address,
        interfaceId: input.interfaceId,
        supported,
      });
    } catch (e) {
      return fail(`supports_interface failed: ${errorMessage(e)}`);
    }
  },
};
