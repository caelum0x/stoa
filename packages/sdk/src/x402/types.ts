// @stoa/sdk — x402 quote type.
//
// The `X402Quote` interface is NOT re-exported from @stoa/skills' public entry
// (only the `getX402Quote` / `parsePaymentRequiredHeader` functions are), so the
// SDK defines its own structurally-compatible shape here.

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
}
