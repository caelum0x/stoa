import { z } from "zod";
import { formatUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc20Abi } from "../../abi/erc20.js";
import { addressSchema } from "../../schemas.js";

export const erc20MetadataSchema = z.object({
  token: addressSchema.describe("ERC-20 token contract address."),
});

/// SKILL: erc20_metadata — name, symbol, decimals, total supply.
export const erc20MetadataAction: Action<typeof erc20MetadataSchema> = {
  name: "ERC20_METADATA",
  similes: ["token info", "token metadata", "name symbol decimals", "total supply"],
  description: "Return an ERC-20 token's name, symbol, decimals, and total supply on Pharos.",
  examples: [
    {
      input: { token: "0xUSDC" },
      output: ok("Token metadata", { symbol: "USDC", decimals: 6 }),
      explanation: "Reads token metadata.",
    },
  ],
  schema: erc20MetadataSchema,
  handler: async (agent, input) => {
    try {
      const [name, symbol, decimals, supply] = await Promise.all([
        agent.publicClient.readContract({ address: input.token, abi: erc20Abi, functionName: "name" }).catch(() => ""),
        agent.publicClient.readContract({ address: input.token, abi: erc20Abi, functionName: "symbol" }).catch(() => ""),
        agent.publicClient.readContract({ address: input.token, abi: erc20Abi, functionName: "decimals" }),
        agent.publicClient.readContract({ address: input.token, abi: erc20Abi, functionName: "totalSupply" }),
      ]);
      const dec = Number(decimals);
      return ok("Token metadata", {
        token: input.token,
        name,
        symbol,
        decimals: dec,
        totalSupply: formatUnits(supply, dec),
      });
    } catch (e) {
      return fail(`erc20_metadata failed: ${errorMessage(e)}`);
    }
  },
};
