import type { StoaAgent } from "../agent.js";
import { x402Network } from "../chains.js";
import { loadOptional } from "./loadOptional.js";

export interface MonetizeOptions {
  /// Route path to protect, e.g. "/insight".
  path: string;
  /// Price in human units (e.g. "0.01").
  price: string;
  /// Port to listen on. Defaults to 0 (an ephemeral free port).
  port?: number;
  /// HTTP method. Defaults to GET.
  method?: "GET" | "POST";
  /// Facilitator base URL. Defaults to X402_FACILITATOR_URL env.
  facilitatorUrl?: string;
  /// Produces the paid response body. Receives the parsed request and returns JSON-serializable data.
  produce: (req: { query: Record<string, unknown>; body: unknown }) => Promise<unknown> | unknown;
}

export interface MonetizedServer {
  url: string;
  port: number;
  close: () => Promise<void>;
}

/// Stand up an x402-paywalled HTTP endpoint that pays out to the agent's address.
/// Used by the `x402_monetize` skill so an agent can sell its output for PHRS/USDC.
export async function createMonetizedServer(
  agent: StoaAgent,
  opts: MonetizeOptions,
): Promise<MonetizedServer> {
  const facilitatorUrl = opts.facilitatorUrl ?? process.env.X402_FACILITATOR_URL;
  if (!facilitatorUrl) {
    throw new Error("No facilitator URL. Set X402_FACILITATOR_URL or pass facilitatorUrl.");
  }

  const expressMod = await loadOptional<{ default: () => any }>("express");
  const express = expressMod.default;
  const { paymentMiddleware, x402ResourceServer } = await loadOptional<{
    paymentMiddleware: (config: unknown, server: unknown) => unknown;
    x402ResourceServer: new (facilitator: unknown) => { register: (n: string, s: unknown) => void };
  }>("@x402/express");
  const { ExactEvmScheme } = await loadOptional<{ ExactEvmScheme: new (s: unknown) => unknown }>(
    "@x402/evm/exact/server",
  );
  const { HTTPFacilitatorClient } = await loadOptional<{
    HTTPFacilitatorClient: new (url: string) => unknown;
  }>("@x402/core/server");

  const network = x402Network(agent.chain.id);
  const facilitator = new HTTPFacilitatorClient(facilitatorUrl);
  const resourceServer = new x402ResourceServer(facilitator);
  resourceServer.register(network, new ExactEvmScheme(agent.account));

  const app = express();
  const method = opts.method ?? "GET";
  const routeKey = `${method} ${opts.path}`;

  app.use(
    paymentMiddleware(
      {
        [routeKey]: {
          accepts: {
            scheme: "exact",
            price: opts.price,
            network,
            payTo: agent.address,
          },
        },
      },
      resourceServer,
    ),
  );

  const handler = async (req: any, res: any) => {
    const data = await opts.produce({ query: req.query ?? {}, body: req.body });
    res.json({ data });
  };
  if (method === "POST") app.post(opts.path, handler);
  else app.get(opts.path, handler);

  const server = await new Promise<any>((resolve) => {
    const s = app.listen(opts.port ?? 0, () => resolve(s));
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : (opts.port ?? 0);

  return {
    url: `http://localhost:${port}${opts.path}`,
    port,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
