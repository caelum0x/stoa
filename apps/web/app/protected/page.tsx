"use client";

import Link from "next/link";
import { useState } from "react";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="font-mono text-sm text-blue-600 hover:underline">
          ← back
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">x402 protected API</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            The endpoint <code className="font-mono bg-gray-100 px-1 rounded">/api/x402/weather</code>{" "}
            speaks the x402 payment protocol. Without an{" "}
            <code className="font-mono bg-gray-100 px-1 rounded">X-PAYMENT</code> header it returns{" "}
            <strong>HTTP 402 Payment Required</strong> describing what it accepts. Resend the request
            with a valid payment and it returns the data and settles.
          </p>
        </header>

        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
          <label className="flex items-center gap-2 mb-4 font-mono text-sm">
            <input
              type="checkbox"
              checked={withPayment}
              onChange={(e) => setWithPayment(e.target.checked)}
            />
            attach demo X-PAYMENT header
          </label>
          <button
            onClick={callApi}
            disabled={state.loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-mono text-white transition-colors"
          >
            {state.loading ? "calling…" : "GET /api/x402/weather"}
          </button>
        </div>

        {state.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-mono text-sm text-red-700">
            {state.error}
          </div>
        )}

        {state.status !== null && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`font-mono text-sm px-2 py-0.5 rounded ${
                  state.status === 402
                    ? "bg-amber-100 text-amber-700"
                    : state.status === 200
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                HTTP {state.status}
              </span>
              <span className="font-mono text-sm text-gray-500">
                {state.status === 402 ? "Payment Required" : "OK"}
              </span>
            </div>
            <pre className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-4 overflow-x-auto font-mono">
              {JSON.stringify(state.body, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
