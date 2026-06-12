"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Container, Card, Button, Badge, Spinner, EmptyState, SectionHeading, short } from "@/components/ui";
import { useWallet } from "@/components/WalletProvider";
import { useTx } from "@/components/ToastProvider";
import { listAgents, registerAgent, ADDR, type AgentInfo } from "@/lib/onchain";

function avg(rep: { count: number; scoreSum: number }): string {
  return rep.count === 0 ? "—" : (rep.scoreSum / rep.count).toFixed(2);
}

export default function Agents() {
  const { address, connect } = useWallet();
  const tx = useTx();
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("Mercator");
  const [skill, setSkill] = useState("research");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!ADDR.registry) return;
    setLoading(true);
    try {
      setAgents(await listAgents());
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function register() {
    setBusy(true);
    try {
      const metadataURI = `data:application/json,${encodeURIComponent(JSON.stringify({ name, skill }))}`;
      await tx("Registering agent", () => registerAgent(metadataURI));
      await load();
    } catch {
      /* toast handles error */
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-12">
      <SectionHeading title="Agents" subtitle="On-chain identities registered in StoaRegistry" />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Agent list */}
        <div>
          {!ADDR.registry ? (
            <EmptyState title="No StoaRegistry configured" hint="Set NEXT_PUBLIC_STOA_REGISTRY_ADDRESS to load agents." />
          ) : loading ? (
            <Spinner label="Loading agents…" />
          ) : agents.length === 0 ? (
            <EmptyState title="No agents registered yet" hint="Register the first one →" />
          ) : (
            <div className="grid gap-3">
              {agents.map((a) => (
                <Link key={a.agentId} href={`/agents/${a.agentId}`} className="block">
                <Card hover className="flex items-center justify-between p-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge>agent #{a.agentId}</Badge>
                      <span className="font-mono text-xs text-zinc-500">{short(a.owner)}</span>
                    </div>
                    <div className="mt-1 truncate font-mono text-xs text-zinc-500">{a.metadataURI}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-cyan-300">★ {avg(a.reputation)}</div>
                    <div className="font-mono text-xs text-zinc-600">{a.reputation.count} ratings</div>
                  </div>
                </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Register panel */}
        <Card className="h-fit p-6">
          <h3 className="font-semibold">Register an agent</h3>
          <p className="mt-1 font-mono text-xs text-zinc-500">Writes an identity to StoaRegistry.</p>
          <div className="mt-5 space-y-4 font-mono text-sm">
            <label className="block">
              <span className="text-zinc-500">name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-400/50"
              />
            </label>
            <label className="block">
              <span className="text-zinc-500">capability</span>
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-400/50"
              />
            </label>
            {address ? (
              <Button onClick={register} disabled={busy} className="w-full">
                {busy ? "Submitting…" : "Register on-chain"}
              </Button>
            ) : (
              <Button variant="outline" onClick={connect} className="w-full">
                Connect wallet
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Container>
  );
}
