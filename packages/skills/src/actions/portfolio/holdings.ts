import { z } from "zod";
import { formatEther, formatUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc20Abi } from "../../abi/erc20.js";
import { addressSchema } from "../../schemas.js";

export const tokenHoldingsSchema = z.object({
  address: addressSchema.optional().describe("Address to query. Defaults to the agent's own address."),
  tokens: z.array(addressSchema).describe("ERC-20 token contract addresses to scan."),
});

interface TokenHolding {
  token: `0x${string}`;
  symbol: string;
  decimals: number;
  raw: string;
  balance: string;
}

/// SKILL: token_holdings — like PORTFOLIO but only tokens with a nonzero balance.
export const tokenHoldingsAction: Action<typeof tokenHoldingsSchema> = {
  name: "TOKEN_HOLDINGS",
  similes: ["nonzero balances", "token holdings", "owned tokens", "active positions"],
  description: "Return the native PHRS balance and only the ERC-20 tokens with a nonzero balance.",
  examples: [
    {
      input: { tokens: ["0xUSDC", "0xDAI"] },
      output: ok("Holdings", { native: "1.5", tokens: [] }),
      explanation: "Filters out zero-balance tokens.",
    },
  ],
  schema: tokenHoldingsSchema,
  handler: async (agent, input) => {
    try {
      const address = input.address ?? agent.address;
      const wei = await agent.publicClient.getBalance({ address });
      const all = await Promise.all(
        input.tokens.map(async (token): Promise<TokenHolding & { zero: boolean }> => {
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
            zero: raw === 0n,
          };
        }),
      );
      const tokens: TokenHolding[] = all
        .filter((h) => !h.zero)
        .map(({ zero: _zero, ...rest }) => rest);
      return ok("Holdings", { address, native: formatEther(wei), nativeWei: wei.toString(), tokens });
    } catch (e) {
      return fail(`token_holdings failed: ${errorMessage(e)}`);
    }
  },
};
