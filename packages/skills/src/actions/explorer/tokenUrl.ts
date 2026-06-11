import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const DEFAULT_EXPLORER = "https://atlantic.pharosscan.xyz";

export const explorerTokenUrlSchema = z.object({
  token: addressSchema.describe("Token contract address to link to."),
});

/// SKILL: explorer_token_url — build a block explorer URL for a token.
export const explorerTokenUrlAction: Action<typeof explorerTokenUrlSchema> = {
  name: "EXPLORER_TOKEN_URL",
  similes: ["token link", "token explorer url", "view token", "scan token"],
  description: "Build the block explorer URL for a token contract on the connected Pharos network.",
  examples: [
    {
      input: { token: "0xUSDC" },
      output: ok("Explorer URL", { url: "https://atlantic.pharosscan.xyz/token/0xUSDC" }),
      explanation: "Links to a token.",
    },
  ],
  schema: explorerTokenUrlSchema,
  handler: async (agent, input) => {
    try {
      const base = (agent.chain.blockExplorers?.default?.url ?? DEFAULT_EXPLORER).replace(/\/$/, "");
      const url = `${base}/token/${input.token}`;
      return ok("Explorer URL", { token: input.token, url });
    } catch (e) {
      return fail(`explorer_token_url failed: ${errorMessage(e)}`);
    }
  },
};
