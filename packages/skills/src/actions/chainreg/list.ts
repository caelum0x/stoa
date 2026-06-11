import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { KNOWN_CHAINS } from "../../chains.js";

export const listKnownChainsSchema = z.object({});

/// SKILL: list_known_chains — enumerate the chains Stoa knows how to connect to.
export const listKnownChainsAction: Action<typeof listKnownChainsSchema> = {
  name: "LIST_KNOWN_CHAINS",
  similes: ["list chains", "known chains", "supported networks", "available chains"],
  description: "List the chains registered with Stoa, including id, name, native currency and default RPC URL.",
  examples: [
    {
      input: {},
      output: ok("Known chains", { count: 2 }),
      explanation: "Enumerates the built-in chain registry.",
    },
  ],
  schema: listKnownChainsSchema,
  handler: async (_agent) => {
    try {
      const chains = Object.values(KNOWN_CHAINS).map((chain) => ({
        id: chain.id,
        name: chain.name,
        nativeCurrency: chain.nativeCurrency,
        rpcUrl: chain.rpcUrls.default.http[0] ?? null,
      }));
      return ok("Known chains", { count: chains.length, chains });
    } catch (e) {
      return fail(`list_known_chains failed: ${errorMessage(e)}`);
    }
  },
};
