import { NextRequest, NextResponse } from "next/server";

// Vendored & adapted from the x402 Next.js fullstack example:
//   examples/typescript/fullstack/next/app/api/weather/route.ts
//
// The upstream route wraps a handler with `withX402(...)` from `@x402/next`,
// which verifies the payment, settles after a successful (status < 400)
// response, and emits the protocol headers for you. That package isn't
// installed here, so this route implements the x402 v1 handshake manually to
// stay self-contained:
//
//   1. No `X-PAYMENT` header  -> 402 Payment Required + `accepts` quote.
//   2. `X-PAYMENT` present    -> 200 with the data + a `PAYMENT-RESPONSE` header.
//
// PRODUCTION NOTE: a real deployment should use the `@x402/next` `withX402`
// wrapper (or @stoa/skills `x402_monetize`) so payments are cryptographically
// verified and actually settled on chain — this manual version only checks for
// the presence of the header and does not verify the payment.

export const dynamic = "force-dynamic";

const PRICE = "$0.001";
const NETWORK = "eip155:688689"; // Pharos Atlantic (CAIP-2)

const PAYMENT_REQUIREMENTS = {
  scheme: "exact" as const,
  price: PRICE,
  network: NETWORK,
  payTo: process.env.X402_PAY_TO ?? "0x0000000000000000000000000000000000000000",
  description: "Stoa weather data",
  mimeType: "application/json",
};

export async function GET(req: NextRequest) {
  const payment = req.headers.get("X-PAYMENT");

  if (!payment) {
    const challenge = {
      accepts: [{ scheme: "exact", price: PRICE, network: NETWORK }],
    };

    return new NextResponse(
      JSON.stringify({
        x402Version: 1,
        error: "Payment Required",
        accepts: [PAYMENT_REQUIREMENTS],
      }),
      {
        status: 402,
        headers: {
          "Content-Type": "application/json",
          "PAYMENT-REQUIRED": Buffer.from(JSON.stringify(challenge)).toString("base64"),
        },
      },
    );
  }

  // Payment header present — return the protected weather data and settle.
  // (A real wrapper would verify `payment` and settle on chain before this.)
  const paymentResponse = {
    settled: true,
    network: NETWORK,
    payer: payment,
  };

  return new NextResponse(
    JSON.stringify({
      report: {
        weather: "sunny",
        temperature: 72,
      },
      settled: true,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "PAYMENT-RESPONSE": Buffer.from(JSON.stringify(paymentResponse)).toString("base64"),
      },
    },
  );
}
