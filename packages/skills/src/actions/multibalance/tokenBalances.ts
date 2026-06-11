import { z } from "zod";
import { formatUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc20Abi } from "../../abi/erc20.js";
import { addressSchema } from "../../schemas.js";

export const tokenBalancesSchema = z.object({
  token: addressSchema.describe("ERC-20 token contract address."),
  accounts: z
    .array(addressSchema)
    .min(1)
    .max(50)
    .describe("Holder addresses to read balances for (max 50)."),
});

/// SKILL: token_balances — batched ERC-20 balances for many accounts.
export const tokenBalancesAction: Action<typeof tokenBalancesSchema> = {
  name: "TOKEN_BALANCES",
  similes: ["token balances", "erc20 balances", "bulk token balance", "multi token balance"],
  description: "Return the ERC-20 balance of one token for each of several accounts on Pharos, formatted by decimals.",
  examples: [
    {
      input: {
        token: "0x2222222222222222222222222222222222222222",
        accounts: ["0x1111111111111111111111111111111111111111"],
      },
      output: ok("Token balances", {
        balances: [{ account: "0x1111111111111111111111111111111111111111", balance: "100.0" }],
      }),
      explanation: "Reads the token balance for each account.",
    },
  ],
  schema: tokenBalancesSchema,
  handler: async (agent, input) => {
    try {
      const decimals = await agent.publicClient.readContract({
        address: input.token,
        abi: erc20Abi,
        functionName: "decimals",
      });
      const balances = await Promise.all(
        input.accounts.map(async (account) => {
          const raw = await agent.publicClient.readContract({
            address: input.token,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [account],
          });
          return { account, balance: formatUnits(raw, Number(decimals)) };
        }),
      );
      return ok("Token balances", { token: input.token, count: balances.length, balances });
    } catch (e) {
      return fail(`token_balances failed: ${errorMessage(e)}`);
    }
  },
};
