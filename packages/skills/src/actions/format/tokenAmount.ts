import { z } from "zod";
import { formatUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

export const formatTokenAmountSchema = z.object({
  value: baseUnitsSchema.describe("Amount in base units (integer string)."),
  decimals: z.coerce.number().int().nonnegative().describe("Token decimals."),
  symbol: z.string().optional().describe("Optional token symbol to suffix."),
});

/// SKILL: format_token_amount — format base-unit amount to a human decimal string.
export const formatTokenAmountAction: Action<typeof formatTokenAmountSchema> = {
  name: "FORMAT_TOKEN_AMOUNT",
  similes: ["format token", "format amount", "humanize token amount", "pretty token amount"],
  description: "Format a base-unit token amount into a human-readable decimal string, optionally suffixed with a symbol. Pure, no network access.",
  examples: [
    {
      input: { value: "1500000", decimals: 6, symbol: "USDC" },
      output: ok("Formatted token amount", { formatted: "1.5 USDC" }),
      explanation: "Formats 1500000 base units of a 6-decimal token.",
    },
  ],
  schema: formatTokenAmountSchema,
  handler: async (_agent, input) => {
    try {
      const human = formatUnits(BigInt(input.value), input.decimals);
      const formatted = input.symbol ? `${human} ${input.symbol}` : human;
      return ok("Formatted token amount", {
        value: input.value,
        decimals: input.decimals,
        symbol: input.symbol,
        human,
        formatted,
      });
    } catch (e) {
      return fail(`format_token_amount failed: ${errorMessage(e)}`);
    }
  },
};
