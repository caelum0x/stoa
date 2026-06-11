import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const DEFAULT_EXPLORER = "https://atlantic.pharosscan.xyz";

export const explorerAddressUrlSchema = z.object({
  address: addressSchema.describe("Address to link to."),
});

/// SKILL: explorer_address_url — build a block explorer URL for an address.
export const explorerAddressUrlAction: Action<typeof explorerAddressUrlSchema> = {
  name: "EXPLORER_ADDRESS_URL",
  similes: ["address link", "account explorer url", "view address", "scan address"],
  description: "Build the block explorer URL for an address on the connected Pharos network.",
  examples: [
    {
      input: { address: "0xabc" },
      output: ok("Explorer URL", { url: "https://atlantic.pharosscan.xyz/address/0xabc" }),
      explanation: "Links to an address.",
    },
  ],
  schema: explorerAddressUrlSchema,
  handler: async (agent, input) => {
    try {
      const base = (agent.chain.blockExplorers?.default?.url ?? DEFAULT_EXPLORER).replace(/\/$/, "");
      const url = `${base}/address/${input.address}`;
      return ok("Explorer URL", { address: input.address, url });
    } catch (e) {
      return fail(`explorer_address_url failed: ${errorMessage(e)}`);
    }
  },
};
