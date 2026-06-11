import type { StoaAgent } from "../agent.js";
import { x402Network } from "../chains.js";
import { loadOptional } from "./loadOptional.js";

/// A parsed x402 payment quote, normalized across header shapes.
export interface X402Quote {
  /// Human price string (e.g. "0.01") when discoverable.
  price?: string;
  /// CAIP-2 network id (e.g. "eip155:688689").
  network?: string;
  /// Recipient address.
  payTo?: string;
  /// Payment asset (token address / symbol) when present.
  asset?: string;
  /// The raw decoded payload for callers that need full fidelity.
  raw: unknown;
}

/// Decode a base64 `PAYMENT-REQUIRED` header into a normalized quote.
/// Pure + side-effect free so it can be unit-tested without a network.
export function parsePaymentRequiredHeader(header: string | null): X402Quote | null {
  if (!header) return null;
  let decoded: string;
  try {
    decoded = Buffer.from(header, "base64").toString("utf8");
  } catch {
    return { raw: header };
  }

  let json: unknown;
  try {
    json = JSON.parse(decoded);
  } catch {
    return { raw: decoded };
  }

  const obj = json as Record<string, unknown>;
  const accepts = Array.isArray(obj?.accepts) ? (obj.accepts[0] as Record<string, unknown>) : obj;
  const priceRaw = accepts?.price ?? accepts?.maxAmountRequired ?? accepts?.amount;

  return {
    price: priceRaw === undefined ? undefined : String(priceRaw),
    network: typeof accepts?.network === "string" ? accepts.network : undefined,
    payTo: typeof accepts?.payTo === "string" ? accepts.payTo : undefined,
    asset: typeof accepts?.asset === "string" ? accepts.asset : undefined,
    raw: json,
  };
}

/// Probe an endpoint for its x402 quote WITHOUT paying.
/// Returns null when the endpoint does not require payment (non-402 response).
export async function getX402Quote(url: string, method = "GET"): Promise<X402Quote | null> {
  const res = await fetch(url, { method });
  if (res.status !== 402) return null;
  const header = res.headers.get("payment-required") ?? res.headers.get("x-payment-required");
  return parsePaymentRequiredHeader(header) ?? { raw: null };
}

export interface PayAndFetchResult {
  ok: boolean;
  status: number;
  body: string;
  /// Base64 `PAYMENT-RESPONSE` header (contains the settlement tx hash) when present.
  paymentResponse?: string;
}

/// Pay an x402-protected endpoint using the official x402 client and return the response.
/// The x402 packages are imported dynamically so the module type-checks without them installed.
export async function payAndFetch(
  agent: StoaAgent,
  url: string,
  init?: RequestInit,
): Promise<PayAndFetchResult> {
  const { wrapFetchWithPayment, x402Client } = await loadOptional<{
    wrapFetchWithPayment: (f: typeof fetch, client: unknown) => typeof fetch;
    x402Client: new () => { register: (network: string, scheme: unknown) => void };
  }>("@x402/fetch");
  const { ExactEvmScheme } = await loadOptional<{
    ExactEvmScheme: new (signer: unknown) => unknown;
  }>("@x402/evm/exact/client");

  const client = new x402Client();
  client.register(x402Network(agent.chain.id), new ExactEvmScheme(agent.account));

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);
  const res: Response = await fetchWithPayment(url, init);
  const body = await res.text();

  return {
    ok: res.ok,
    status: res.status,
    body,
    paymentResponse: res.headers.get("payment-response") ?? undefined,
  };
}
