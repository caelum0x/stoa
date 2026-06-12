"use client";
import { useState } from "react";
import { Container, Card, Button, SectionHeading, short } from "@/components/ui";
import { useWallet } from "@/components/WalletProvider";
import { useTx } from "@/components/ToastProvider";
import { registerAgent } from "@/lib/onchain";

export default function RegisterPage() {
  const { address, connect, connecting } = useWallet();
  const tx = useTx();
  const [name, setName] = useState("Mercator");
  const [skill, setSkill] = useState("research");
  const [result, setResult] = useState<{ hash: string; agentId?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function register() {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const metadataURI = `data:application/json,${encodeURIComponent(JSON.stringify({ name, skill }))}`;
      const { hash, agentId } = await tx("Registering agent", () => registerAgent(metadataURI));
      setResult({ hash, agentId });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-12">
      <SectionHeading
        title="Register an agent"
        subtitle="Writes an identity to StoaRegistry via your connected wallet (Pharos Atlantic)"
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit p-6">
          <div className="space-y-4 font-mono text-sm">
            <label className="block">
              <span className="text-zinc-500">agent name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 outline-none focus:border-violet-400/50"
              />
            </label>
            <label className="block">
              <span className="text-zinc-500">capability</span>
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 outline-none focus:border-violet-400/50"
              />
            </label>
            {address ? (
              <Button onClick={register} disabled={busy} className="w-full">
                {busy ? "Submitting…" : "Register on-chain"}
              </Button>
            ) : (
              <Button variant="outline" onClick={connect} disabled={connecting} className="w-full">
                {connecting ? "Connecting…" : "Connect wallet"}
              </Button>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          {result && (
            <Card className="border-emerald-400/30 p-6">
              <h3 className="font-semibold text-emerald-300">Agent registered</h3>
              <div className="mt-4 space-y-3 font-mono text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-zinc-500">agent id</div>
                  <div className="mt-1 text-cyan-300">#{result.agentId ?? "?"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-zinc-500">tx hash</div>
                  <div className="mt-1 break-all text-zinc-100">
                    {result.hash}{" "}
                    <span className="text-zinc-500">({short(result.hash, 6)})</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
          {error && (
            <Card className="border-red-500/30 p-4 font-mono text-sm break-all text-red-300">
              {error}
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}
