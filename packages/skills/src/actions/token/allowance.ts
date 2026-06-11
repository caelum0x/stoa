import { z } from "zod";
import { formatUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { erc20Abi } from "../../abi/erc20.js";
import { addressSchema } from "../../schemas.js";

export const erc20AllowanceSchema = z.object({
  token: addressSchema.describe("ERC-20 token contract address."),
  owner: addressSchema.optional().describe("Token owner. Defaults to the agent."),
  spender: addressSchema.describe("Spender to check."),
});

/// SKILL: erc20_allowance — remaining allowance for a spender.
export const erc20AllowanceAction: Action<typeof erc20AllowanceSchema> = {
  name: "ERC20_ALLOWANCE",
  similes: ["check allowance", "remaining approval", "spender allowance"],
  description: "Return the remaining ERC-20 allowance an owner has granted a spender on Pharos.",
  examples: [
    {
      input: { token: "0xUSDC", spender: "0xRouter" },
      output: ok("Allowance", { allowance: "100.0" }),
      explanation: "Reads the agent→router allowance.",
    },
  ],
  schema: erc20AllowanceSchema,
  handler: async (agent, input) => {
    try {
      const owner = input.owner ?? agent.address;
      const [raw, decimals] = await Promise.all([
        agent.publicClient.readContract({ address: input.token, abi: erc20Abi, functionName: "allowance", args: [owner, input.spender] }),
        agent.publicClient.readContract({ address: input.token, abi: erc20Abi, functionName: "decimals" }),
      ]);
      return ok("Allowance", {
        token: input.token,
        owner,
        spender: input.spender,
        raw: raw.toString(),
        allowance: formatUnits(raw, Number(decimals)),
      });
    } catch (e) {
      return fail(`erc20_allowance failed: ${errorMessage(e)}`);
    }
  },
};
