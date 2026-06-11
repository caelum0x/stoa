import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { baseUnitsSchema } from "../../schemas.js";

const FRACTION_DIGITS = 8n;

export const priceFromReservesSchema = z.object({
  reserveIn: baseUnitsSchema.describe("Reserve of the input token, base units as a string."),
  reserveOut: baseUnitsSchema.describe("Reserve of the output token, base units as a string."),
  decimalsOut: z.coerce
    .number()
    .int()
    .min(0)
    .default(18)
    .describe("Decimals of the output token (currently informational). Defaults to 18."),
});

/// SKILL: price_from_reserves — spot price reserveOut/reserveIn as a decimal string.
export const priceFromReservesAction: Action<typeof priceFromReservesSchema> = {
  name: "PRICE_FROM_RESERVES",
  similes: ["price from reserves", "pool spot price", "amm price", "reserve ratio"],
  description:
    "Compute the spot price reserveOut / reserveIn as a decimal string with up to 8 fraction digits using exact bigint math. No network access.",
  examples: [
    {
      input: { reserveIn: "1000000", reserveOut: "2500000" },
      output: ok("Spot price", { priceString: "2.5" }),
      explanation: "2,500,000 / 1,000,000 = 2.5 output per input.",
    },
  ],
  schema: priceFromReservesSchema,
  handler: async (_agent, input) => {
    try {
      const reserveIn = BigInt(input.reserveIn);
      const reserveOut = BigInt(input.reserveOut);
      if (reserveIn === 0n) {
        return fail("price_from_reserves failed: reserveIn must be non-zero");
      }
      const scale = 10n ** FRACTION_DIGITS;
      const scaled = (reserveOut * scale) / reserveIn;
      const whole = scaled / scale;
      const frac = (scaled % scale).toString().padStart(Number(FRACTION_DIGITS), "0").replace(/0+$/, "");
      const priceString = frac.length > 0 ? `${whole.toString()}.${frac}` : whole.toString();
      return ok("Spot price", {
        reserveIn: input.reserveIn,
        reserveOut: input.reserveOut,
        decimalsOut: input.decimalsOut,
        priceString,
      });
    } catch (e) {
      return fail(`price_from_reserves failed: ${errorMessage(e)}`);
    }
  },
};
