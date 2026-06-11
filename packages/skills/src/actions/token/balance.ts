import { z } from "zod";
import { formatUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc20Abi } from "../../abi/erc20.js";
import { addressSchema } from "../../schemas.js";

export const erc20BalanceSchema = z.object({
  token: addressSchema.describe("ERC-20 token contract address."),
  account: addressSchema.optional().describe("Holder address. Defaults to the agent."),
});

/// SKILL: erc20_balance — token balance of an account, decimal-formatted.
export const erc20BalanceAction: Action<typeof erc20BalanceSchema> = {
  name: "ERC20_BALANCE",
  similes: ["token balance", "erc20 balance", "how many tokens", "check token holdings"],
  description: "Return the ERC-20 balance of an account on Pharos, formatted by the token's decimals.",
  examples: [
    {
      input: { token: "0xUSDC" },
      output: ok("Token balance", { balance: "100.0" }),
      explanation: "Reads the agent's USDC balance.",
    },
  ],
  schema: erc20BalanceSchema,
  handler: async (agent, input) => {
    try {
      const account = input.account ?? agent.address;
      const [raw, decimals, symbol] = await Promise.all([
        agent.publicClient.readContract({ address: input.token, abi: erc20Abi, functionName: "balanceOf", args: [account] }),
        agent.publicClient.readContract({ address: input.token, abi: erc20Abi, functionName: "decimals" }),
        agent.publicClient.readContract({ address: input.token, abi: erc20Abi, functionName: "symbol" }).catch(() => ""),
      ]);
      return ok("Token balance", {
        token: input.token,
        account,
        raw: raw.toString(),
        balance: formatUnits(raw, Number(decimals)),
        symbol,
      });
    } catch (e) {
      return fail(`erc20_balance failed: ${errorMessage(e)}`);
    }
  },
};
