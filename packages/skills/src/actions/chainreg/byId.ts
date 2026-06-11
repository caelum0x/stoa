import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { KNOWN_CHAINS } from "../../chains.js";

export const chainByIdSchema = z.object({
  chainId: z.coerce.number().int().positive().describe("EVM chain id to look up in the Stoa registry."),
});

/// SKILL: chain_by_id — look up a known chain by its numeric id.
export const chainByIdAction: Action<typeof chainByIdSchema> = {
  name: "CHAIN_BY_ID",
  similes: ["chain by id", "lookup chain", "find chain", "get chain"],
  description: "Look up a chain in the Stoa registry by its numeric id and return id, name and native currency.",
  examples: [
    {
      input: { chainId: 688689 },
      output: ok("Chain", { id: 688689, name: "Pharos Atlantic Testnet" }),
      explanation: "Resolves the Pharos Atlantic chain by id.",
    },
  ],
  schema: chainByIdSchema,
  handler: async (_agent, input) => {
    try {
      const chain = KNOWN_CHAINS[input.chainId];
      if (chain === undefined) {
        return fail(`chain_by_id failed: unknown chain id ${input.chainId}`);
      }
      return ok("Chain", {
        id: chain.id,
        name: chain.name,
        nativeCurrency: chain.nativeCurrency,
      });
    } catch (e) {
      return fail(`chain_by_id failed: ${errorMessage(e)}`);
    }
  },
};
