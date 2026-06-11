import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

const DEFAULT_EXPLORER = "https://atlantic.pharosscan.xyz";

const txHashSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Must be a 0x-prefixed 32-byte transaction hash");

export const explorerTxUrlSchema = z.object({
  hash: txHashSchema.describe("Transaction hash to link to."),
});

/// SKILL: explorer_tx_url — build a block explorer URL for a transaction.
export const explorerTxUrlAction: Action<typeof explorerTxUrlSchema> = {
  name: "EXPLORER_TX_URL",
  similes: ["transaction link", "tx explorer url", "view transaction", "scan tx"],
  description: "Build the block explorer URL for a transaction hash on the connected Pharos network.",
  examples: [
    {
      input: { hash: "0xabc" },
      output: ok("Explorer URL", { url: "https://atlantic.pharosscan.xyz/tx/0xabc" }),
      explanation: "Links to a transaction.",
    },
  ],
  schema: explorerTxUrlSchema,
  handler: async (agent, input) => {
    try {
      const base = (agent.chain.blockExplorers?.default?.url ?? DEFAULT_EXPLORER).replace(/\/$/, "");
      const url = `${base}/tx/${input.hash}`;
      return ok("Explorer URL", { hash: input.hash, url });
    } catch (e) {
      return fail(`explorer_tx_url failed: ${errorMessage(e)}`);
    }
  },
};
