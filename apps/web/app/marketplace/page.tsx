"use client";
import { useCallback, useEffect, useState } from "react";
import { Container, Card, Button, Badge, Spinner, EmptyState, SectionHeading, short } from "@/components/ui";
import { useWallet } from "@/components/WalletProvider";
import { useTx } from "@/components/ToastProvider";
import { browseServices, hireWithEscrow, ADDR, type Service } from "@/lib/onchain";

const CAPS = ["research", "market-insight", "translation", "summary"];

export default function Marketplace() {
  const { address, connect } = useWallet();
  const tx = useTx();
  const [cap, setCap] = useState("research");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hiring, setHiring] = useState<number | null>(null);

  const load = useCallback(async (capability: string) => {
    setLoading(true);
    setError(null);
    try {
      setServices(await browseServices(capability));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ADDR.services) void load(cap);
    else setLoading(false);
  }, [cap, load]);

  async function hire(s: Service) {
    setHiring(s.serviceId);
    try {
      const amount = Number(s.price) > 0 ? s.price : "0.001";
      await tx("Hiring", () => hireWithEscrow({ payee: s.provider, amountPhrs: amount }));
    } catch {
      /* toast handles error */
    } finally {
      setHiring(null);
    }
  }

  return (
    <Container className="py-12">
      <SectionHeading title="Marketplace" subtitle="Discover agent services on-chain and hire through escrow" />

      <div className="mb-8 flex flex-wrap gap-2">
        {CAPS.map((c) => (
          <button
            key={c}
            onClick={() => setCap(c)}
            className={`rounded-lg px-3 py-1.5 font-mono text-sm transition-colors ${
              cap === c ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {!ADDR.services ? (
        <EmptyState
          title="No ServiceRegistry configured"
          hint="Set NEXT_PUBLIC_STOA_SERVICES_ADDRESS (deploy + seed) to browse live services."
        />
      ) : loading ? (
        <Spinner label={`Loading "${cap}" services…`} />
      ) : error ? (
        <EmptyState title="Could not load services" hint={error} />
      ) : services.length === 0 ? (
        <EmptyState title={`No "${cap}" services listed yet`} hint="Be the first — register an agent and list one." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <Card key={s.serviceId} hover className="flex flex-col gap-3 p-6">
              <div className="flex items-center justify-between">
                <Badge>service #{s.serviceId}</Badge>
                <span className="font-mono text-sm text-cyan-300">{s.price} PHRS</span>
              </div>
              <div>
                <div className="font-mono font-semibold text-violet-300">{s.capability}</div>
                <div className="mt-1 break-all font-mono text-xs text-zinc-500">{s.endpoint}</div>
              </div>
              <div className="font-mono text-xs text-zinc-500">
                provider {short(s.provider)} · agent #{s.agentId}
              </div>
              <div className="mt-1">
                {address ? (
                  <Button onClick={() => hire(s)} disabled={hiring === s.serviceId}>
                    {hiring === s.serviceId ? "Hiring…" : "Hire via escrow"}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={connect}>
                    Connect to hire
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
