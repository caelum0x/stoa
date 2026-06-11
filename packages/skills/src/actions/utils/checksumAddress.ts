import { z } from "zod";
import { getAddress } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const checksumAddressSchema = z.object({
  value: z.string().describe("Address to convert to EIP-55 checksummed form."),
});

/// SKILL: checksum_address — return the EIP-55 checksummed form of an address.
export const checksumAddressAction: Action<typeof checksumAddressSchema> = {
  name: "CHECKSUM_ADDRESS",
  similes: ["checksum address", "normalize address", "eip55", "to checksum"],
  description: "Convert an EVM address to its EIP-55 checksummed representation.",
  examples: [
    {
      input: { value: "0x52908400098527886e0f7030069857d2e4169ee7" },
      output: ok("Checksummed", { address: "0x52908400098527886E0F7030069857D2E4169EE7" }),
      explanation: "Checksums an address.",
    },
  ],
  schema: checksumAddressSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Checksummed", { address: getAddress(input.value) });
    } catch (e) {
      return fail(`checksum_address failed: ${errorMessage(e)}`);
    }
  },
};
