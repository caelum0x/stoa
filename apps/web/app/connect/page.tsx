"use client";
import { useState } from "react";
import Link from "next/link";
import { connectWallet, switchToPharos, getPhrsBalance, PHAROS_ATLANTIC } from "@/lib/wallet";

export default function ConnectPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onConnect() {
    setError(null);
    setBusy(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      setBalance(await getPhrsBalance(addr));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/" className="text-sm text-blue-600 font-mono">&larr; back</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Connect to Pharos</h1>
        <p className="text-gray-600 mb-8 font-mono text-sm">
          Chain {PHAROS_ATLANTIC.id} · {PHAROS_ATLANTIC.name}
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={onConnect}
            disabled={busy}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-mono transition-colors"
          >
            {busy ? "Connecting…" : address ? "Reconnect" : "Connect wallet"}
          </button>
          <button
            onClick={() => switchToPharos().catch((e) => setError(String(e)))}
            className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg font-mono transition-colors"
          >
            Add Pharos network
          </button>
        </div>

        {address && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-2 font-mono text-sm">
            <div><span className="text-gray-500">address:</span> {address}</div>
            <div><span className="text-gray-500">PHRS balance:</span> {balance ?? "…"}</div>
          </div>
        )}
        {error && <p className="mt-4 text-red-600 font-mono text-sm">{error}</p>}
      </div>
    </main>
  );
}
