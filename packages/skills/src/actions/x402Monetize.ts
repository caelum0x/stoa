import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../types.js";
import { decimalAmountSchema } from "../schemas.js";
import { createMonetizedServer, type MonetizedServer } from "../tools/x402Server.js";

export const x402MonetizeSchema = z.object({
  path: z.string().startsWith("/").default("/resource").describe("Route path to paywall."),
  price: decimalAmountSchema.describe("Price per request in human units, e.g. \"0.01\"."),
  port: z.coerce.number().int().min(0).max(65535).optional().describe("Port (0 = ephemeral)."),
  method: z.enum(["GET", "POST"]).default("GET"),
  content: z.string().describe("The content this endpoint sells (returned after payment)."),
  facilitatorUrl: z.string().url().optional().describe("x402 facilitator base URL."),
});

/// Tracks live servers started by this skill so they can be closed later.
const liveServers = new Map<string, MonetizedServer>();

/// SKILL: x402_monetize
/// Turns an agent's output into a paid, x402-protected endpoint. The rare "seller" half of
/// agent commerce — payments settle to the agent's own address on Pharos.
export const x402MonetizeAction: Action<typeof x402MonetizeSchema> = {
  name: "X402_MONETIZE",
  similes: ["sell data", "paywall", "monetize endpoint", "charge for api", "become a seller"],
  description:
    "Expose content behind an x402 paywall on Pharos. Returns a URL that other agents can pay " +
    "to access; revenue settles to this agent's address.",
  examples: [
    {
      input: { path: "/insight", price: "0.02", content: "alpha: BUY signal at 0.91" },
      output: ok("Monetized endpoint live", { url: "http://localhost:54211/insight" }),
      explanation: "Agent sells a trading insight for 0.02 per request.",
    },
  ],
  schema: x402MonetizeSchema,
  handler: async (agent, input) => {
    try {
      const server = await createMonetizedServer(agent, {
        path: input.path,
        price: input.price,
        port: input.port,
        method: input.method,
        facilitatorUrl: input.facilitatorUrl,
        produce: () => input.content,
      });
      liveServers.set(server.url, server);
      return ok("Monetized endpoint live", {
        url: server.url,
        port: server.port,
        price: input.price,
        payTo: agent.address,
      });
    } catch (e) {
      return fail(`x402_monetize failed: ${errorMessage(e)}`);
    }
  },
};

/// Close a server started by x402_monetize (used by demos/tests for clean shutdown).
export async function closeMonetizedServer(url: string): Promise<void> {
  const server = liveServers.get(url);
  if (server) {
    await server.close();
    liveServers.delete(url);
  }
}
