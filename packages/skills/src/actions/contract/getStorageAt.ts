import { z } from "zod";
import { toHex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const getStorageAtSchema = z.object({
  address: addressSchema.describe("Contract address to read storage from."),
  slot: z.string().describe("Storage slot, as a decimal number string or 0x hex."),
});

/// SKILL: get_storage_at — read a raw storage slot from a contract.
export const getStorageAtAction: Action<typeof getStorageAtSchema> = {
  name: "GET_STORAGE_AT",
  similes: ["read storage", "storage slot", "raw storage", "eth_getStorageAt"],
  description: "Read the raw 32-byte value stored at a contract storage slot.",
  examples: [
    {
      input: { address: "0xabc", slot: "0" },
      output: ok("Storage value", { value: "0x0000...0001" }),
      explanation: "Reads slot 0 of a contract.",
    },
  ],
  schema: getStorageAtSchema,
  handler: async (agent, input) => {
    try {
      const slot = input.slot.startsWith("0x")
        ? (input.slot as `0x${string}`)
        : toHex(BigInt(input.slot));
      const value = await agent.publicClient.getStorageAt({
        address: input.address,
        slot,
      });
      return ok("Storage value", { address: input.address, slot, value: value ?? "0x" });
    } catch (e) {
      return fail(`get_storage_at failed: ${errorMessage(e)}`);
    }
  },
};
