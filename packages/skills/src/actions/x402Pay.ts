import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../types.js";
import { decimalAmountSchema } from "../schemas.js";
import { getX402Quote, payAndFetch } from "../tools/x402.js";

export const x402PaySchema = z.object({
  url: z.string().url().describe("The x402-protected URL to pay for and fetch."),
  method: z.enum(["GET", "POST"]).default("GET").describe("HTTP method."),
  body: z.string().optional().describe("Optional request body for POST."),
  maxPrice: decimalAmountSchema
    .optional()
    .describe("Maximum price willing to pay. Aborts before paying if the quote exceeds this."),
});

/// SKILL: x402_pay
/// Lets an agent autonomously pay for and consume any x402-protected resource on Pharos,
/// with an optional budget guard that inspects the 402 quote before authorizing payment.
export const x402PayAction: Action<typeof x402PaySchema> = {
  name: "X402_PAY",
  similes: ["pay for api", "fetch paid resource", "pay 402", "buy data", "pay per use", "micropayment"],
  description:
    "Pay an x402-protected HTTP endpoint on Pharos and return its content. Optionally enforces a " +
    "maxPrice budget by reading the 402 quote before paying.",
  examples: [
    {
      input: { url: "https://api.example.com/insight", maxPrice: "0.05" },
      output: ok("Paid and fetched x402 resource", { status: 200 }),
      explanation: "Agent pays up to 0.05 for a protected insight endpoint, aborting if it costs more.",
    },
  ],
  schema: x402PaySchema,
  handler: async (agent, input) => {
    try {
      // 1) Budget preflight: read the quote without paying.
      if (input.maxPrice) {
        const quote = await getX402Quote(input.url, input.method);
        if (quote?.price && Number(quote.price) > Number(input.maxPrice)) {
          return fail(
            `Quote ${quote.price} exceeds maxPrice ${input.maxPrice}; payment aborted.`,
          );
        }
      }

      // 2) Pay + fetch via the official x402 client.
      const init: RequestInit =
        input.method === "POST"
          ? { method: "POST", body: input.body, headers: { "content-type": "application/json" } }
          : { method: input.method };

      const res = await payAndFetch(agent, input.url, init);
      if (!res.ok) {
        return fail(`Request failed with status ${res.status}: ${res.body.slice(0, 200)}`);
      }

      return ok("Paid and fetched x402 resource", {
        status: res.status,
        body: res.body,
        paymentResponse: res.paymentResponse,
      });
    } catch (e) {
      return fail(`x402_pay failed: ${errorMessage(e)}`);
    }
  },
};
