"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Agent {
  agentId: number;
  owner?: string;
  metadataURI?: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => {
        setAgents(d.agents ?? []);
        setSource(d.source ?? "");
      })
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-sm text-blue-600 font-mono">&larr; back</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Agents</h1>
        <p className="text-gray-600 mb-8 font-mono text-sm">
          Registered in StoaRegistry {source === "demo" && "· (demo data — deploy + seed to populate)"}
        </p>

        {loading ? (
          <p className="font-mono text-sm text-gray-500">Loading…</p>
        ) : agents.length === 0 ? (
          <p className="font-mono text-sm text-gray-500">No agents yet.</p>
        ) : (
          <div className="grid gap-4">
            {agents.map((a) => (
              <div key={a.agentId} className="rounded-xl border border-gray-200 bg-white p-5 font-mono text-sm">
                <div className="font-bold text-blue-700">agent #{a.agentId}</div>
                <div className="text-gray-500 break-all">owner: {a.owner}</div>
                <div className="text-gray-500 break-all">metadata: {a.metadataURI}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
