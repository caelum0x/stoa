"use client";
import { useState } from "react";
import Link from "next/link";
import { registerAgentOnChain } from "@/lib/contracts";

export default function RegisterPage() {
  const [name, setName] = useState("Mercator");
  const [skill, setSkill] = useState("research");
  const [tx, setTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function register() {
    setError(null);
    setTx(null);
    setBusy(true);
    try {
      const metadataURI = `data:application/json,${encodeURIComponent(JSON.stringify({ name, skill }))}`;
      const hash = await registerAgentOnChain(metadataURI);
      setTx(hash);
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
        <h1 className="text-3xl font-bold mt-4 mb-2">Register an agent</h1>
        <p className="text-gray-600 mb-8 font-mono text-sm">
          Writes an identity to StoaRegistry via your connected wallet (Pharos Atlantic).
        </p>

        <div className="space-y-4 font-mono text-sm">
          <label className="block">
            <span className="text-gray-500">agent name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 bg-white"
            />
          </label>
          <label className="block">
            <span className="text-gray-500">capability</span>
            <input
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 bg-white"
            />
          </label>
          <button
            onClick={register}
            disabled={busy}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {busy ? "Submitting…" : "Register on-chain"}
          </button>
        </div>

        {tx && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 font-mono text-sm break-all">
            <span className="text-green-700">tx:</span> {tx}
          </div>
        )}
        {error && <p className="mt-4 text-red-600 font-mono text-sm break-all">{error}</p>}
      </div>
    </main>
  );
}
