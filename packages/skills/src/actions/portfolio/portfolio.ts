import { z } from "zod";
import { formatEther, formatUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc20Abi } from "../../abi/erc20.js";
import { addressSchema } from "../../schemas.js";

export const portfolioSchema = z.object({
  address: addressSchema.optional().describe("Address to query. Defaults to the agent's own address."),
  tokens: z.array(addressSchema).describe("ERC-20 token contract addresses to include."),
});

interface TokenHolding {
  token: `0x${string}`;
  symbol: string;
  decimals: number;
  raw: string;
  balance: string;
}

/// SKILL: portfolio — native PHRS balance plus each token's symbol, decimals, and balance.
export const portfolioAction: Action<typeof portfolioSchema> = {
  name: "PORTFOLIO",
  similes: ["portfolio", "wallet overview", "all balances", "holdings summary"],
  description: "Return the native PHRS balance and formatted balances for a list of ERC-20 tokens.",
  examples: [
    {
      input: { tokens: ["0xUSDC"] },
      output: ok("Portfolio", { native: "1.5", tokens: [] }),
      explanation: "Reads native plus token balances.",
    },
  ],
  schema: portfolioSchema,
  handler: async (agent, input) => {
    try {
      const address = input.address ?? agent.address;
      const wei = await agent.publicClient.getBalance({ address });
      const tokens: TokenHolding[] = await Promise.all(
        input.tokens.map(async (token): Promise<TokenHolding> => {
          const [raw, decimals, symbol] = await Promise.all([
            agent.publicClient.readContract({ address: token, abi: erc20Abi, functionName: "balanceOf", args: [address] }),
            agent.publicClient.readContract({ address: token, abi: erc20Abi, functionName: "decimals" }),
            agent.publicClient.readContract({ address: token, abi: erc20Abi, functionName: "symbol" }).catch(() => ""),
          ]);
          return {
            token,
            symbol,
            decimals: Number(decimals),
            raw: raw.toString(),
            balance: formatUnits(raw, Number(decimals)),
          };
        }),
      );
      return ok("Portfolio", { address, native: formatEther(wei), nativeWei: wei.toString(), tokens });
    } catch (e) {
      return fail(`portfolio failed: ${errorMessage(e)}`);
    }
  },
};
