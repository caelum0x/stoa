"use client";

import { useState } from "react";
import { Container, Card, Button, Badge, SectionHeading } from "@/components/ui";

interface FetchState {
  status: number | null;
  body: unknown;
  paymentRequired: unknown;
  loading: boolean;
  error: string | null;
}

const initialState: FetchState = {
  status: null,
  body: null,
  paymentRequired: null,
  loading: false,
  error: null,
};

export default function ProtectedPage() {
  const [state, setState] = useState<FetchState>(initialState);
  const [withPayment, setWithPayment] = useState(false);

  async function callApi() {
    setState({ ...initialState, loading: true });
    try {
      const headers: Record<string, string> = {};
      // A real client would attach a signed payment payload here. We send a
      // placeholder to demonstrate the "paid" branch of the x402 flow.
      if (withPayment) headers["X-PAYMENT"] = "demo-payment-proof";

      const res = await fetch("/api/x402/weather", { headers });
      const body = await res.json().catch(() => null);

      setState({
        status: res.status,
        body,
        paymentRequired: res.status === 402 ? body : null,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        ...initialState,
        error: err instanceof Error ? err.message : "Request failed",
      });
    }
  }

  const is402 = state.status === 402;
  const is200 = state.status === 200;

  return (
    <Container className="py-12">
      <SectionHeading
        title="x402 paid API"
        subtitle="Pay-per-call HTTP via the x402 payment protocol"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-6">
            <label className="mb-4 flex items-center gap-2 font-mono text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={withPayment}
                onChange={(e) => setWithPayment(e.target.checked)}
                className="accent-violet-500"
              />
              attach demo X-PAYMENT header
            </label>
            <Button onClick={callApi} disabled={state.loading}>
              {state.loading ? "calling…" : "GET /api/x402/weather"}
            </Button>
          </Card>

          {state.error && (
            <Card className="border-red-500/30 p-4 font-mono text-sm text-red-300">
              {state.error}
            </Card>
          )}

          {state.status !== null && (
            <Card className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Badge
                  className={
                    is402
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                      : is200
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : ""
                  }
                >
                  HTTP {state.status}
                </Badge>
                <span className="font-mono text-sm text-zinc-500">
                  {is402 ? "Payment Required" : is200 ? "OK · settled" : ""}
                </span>
              </div>
              <pre className="scroll-thin overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-emerald-300">
                {JSON.stringify(state.body, null, 2)}
              </pre>
            </Card>
          )}
        </div>

        <Card className="h-fit p-6">
          <h3 className="font-semibold text-zinc-100">How it works</h3>
          <ol className="mt-4 space-y-3 font-mono text-xs leading-relaxed text-zinc-400">
            <li>
              <span className="text-violet-300">1 ·</span> Request{" "}
              <code className="text-cyan-300">/api/x402/weather</code> with no payment.
            </li>
            <li>
              <span className="text-violet-300">2 ·</span> Server replies{" "}
              <span className="text-amber-300">402 Payment Required</span> describing what it accepts.
            </li>
            <li>
              <span className="text-violet-300">3 ·</span> Resend with a valid{" "}
              <code className="text-cyan-300">X-PAYMENT</code> header.
            </li>
            <li>
              <span className="text-violet-300">4 ·</span> Server returns{" "}
              <span className="text-emerald-300">200 OK</span> with data and settles the payment.
            </li>
          </ol>
        </Card>
      </div>
    </Container>
  );
}
