"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container, Card, Badge, Spinner, EmptyState, SectionHeading, LinkButton, short } from "@/components/ui";
import {
  getAgentById,
  reputationHistory,
  servicesByProvider,
  type AgentInfo,
  type Attestation,
  type Service,
} from "@/lib/onchain";

function agentName(uri: string): string | null {
  try {
    if (uri.startsWith("data:application/json,")) {
      const json = JSON.parse(decodeURIComponent(uri.slice("data:application/json,".length)));
      return json.name ?? null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function avg(rep: { count: number; scoreSum: number }): string {
  return rep.count === 0 ? "—" : (rep.scoreSum / rep.count).toFixed(2);
}

export default function AgentProfile() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [history, setHistory] = useState<Attestation[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const a = await getAgentById(id).catch(() => null);
      if (!alive) return;
      setAgent(a);
      if (a) {
        const [h, s] = await Promise.all([
          reputationHistory(id).catch(() => []),
          servicesByProvider(a.owner).catch(() => []),
        ]);
        if (!alive) return;
        setHistory(h);
        setServices(s);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Container className="py-12">
        <Spinner label={`Loading agent #${id}…`} />
      </Container>
    );
  }

  if (!agent) {
    return (
      <Container className="py-12">
        <EmptyState title={`Agent #${id} not found`} hint="It may not be registered, or the registry isn't configured." />
        <div className="mt-6">
          <LinkButton href="/agents" variant="outline">
            ← all agents
          </LinkButton>
        </div>
      </Container>
    );
  }

  const name = agentName(agent.metadataURI);

  return (
    <Container className="py-12">
      <SectionHeading title={name ? `${name}` : `Agent #${agent.agentId}`} subtitle={`agent #${agent.agentId}`} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity */}
        <Card className="p-6">
          <h3 className="font-semibold">Identity</h3>
          <div className="mt-4 space-y-3 font-mono text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">owner</div>
              <div className="mt-1 break-all text-zinc-100">{agent.owner}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">metadata</div>
              <div className="mt-1 break-all text-zinc-400">{agent.metadataURI}</div>
            </div>
          </div>
        </Card>

        {/* Reputation */}
        <Card className="p-6">
          <h3 className="font-semibold">Reputation</h3>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-bold gradient-text">★ {avg(agent.reputation)}</span>
            <span className="font-mono text-sm text-zinc-500">{agent.reputation.count} ratings</span>
          </div>
          <div className="mt-5 space-y-2">
            {history.length === 0 ? (
              <p className="font-mono text-xs text-zinc-500">No attestations yet.</p>
            ) : (
              history.map((h, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 font-mono text-xs">
                  <span className="text-zinc-400">{short(h.from)}</span>
                  <span className={h.score >= 0 ? "text-emerald-300" : "text-red-300"}>
                    {h.score >= 0 ? `+${h.score}` : h.score}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Services */}
        <Card className="p-6">
          <h3 className="font-semibold">Services</h3>
          <div className="mt-4 space-y-2">
            {services.length === 0 ? (
              <p className="font-mono text-xs text-zinc-500">No services listed.</p>
            ) : (
              services.map((s) => (
                <div key={s.serviceId} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-violet-300">{s.capability}</span>
                    <span className="text-cyan-300">{s.price} PHRS</span>
                  </div>
                  <div className="mt-1 truncate text-zinc-500">{s.endpoint}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <LinkButton href="/agents" variant="ghost">
          ← all agents
        </LinkButton>
      </div>
    </Container>
  );
}
