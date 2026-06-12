"use client";
import { useCallback, useEffect, useState } from "react";
import { Container, Card, Button, Badge, Spinner, EmptyState, SectionHeading, LinkButton, short } from "@/components/ui";
import { useWallet } from "@/components/WalletProvider";
import { useTx } from "@/components/ToastProvider";
import { getPrimaryAgentId, listService, myJobs, releaseMilestone, attestReputation, ADDR, type Job } from "@/lib/onchain";

export default function Dashboard() {
  const { address, connect } = useWallet();
  const tx = useTx();
  const [agentId, setAgentId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  // List-service form
  const [cap, setCap] = useState("research");
  const [endpoint, setEndpoint] = useState("https://my-agent.example/x402/summary");
  const [price, setPrice] = useState("0.01");
  const [listing, setListing] = useState(false);
  const [releasing, setReleasing] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [id, j] = await Promise.all([
        getPrimaryAgentId(address).catch(() => 0),
        ADDR.escrow ? myJobs(address).catch(() => []) : Promise.resolve([]),
      ]);
      setAgentId(id);
      setJobs(j);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function doList() {
    if (!agentId) return;
    setListing(true);
    try {
      await tx("Listing service", () => listService({ agentId, capability: cap, endpoint, price }));
    } catch {
      /* toast handles error */
    } finally {
      setListing(false);
    }
  }

  const [rating, setRating] = useState<number | null>(null);
  async function doRate(job: Job) {
    setRating(job.jobId);
    try {
      const id = await getPrimaryAgentId(job.payee);
      if (!id) throw new Error("Payee has no registered agent to rate.");
      await tx("Rating provider", () => attestReputation(id, 5, `stoa:job/${job.jobId}`));
    } catch {
      /* toast handles error */
    } finally {
      setRating(null);
    }
  }

  async function doRelease(jobId: number, index: number) {
    const key = `${jobId}-${index}`;
    setReleasing(key);
    try {
      await tx("Releasing milestone", () => releaseMilestone(jobId, index));
      await refresh();
    } catch {
      /* toast handles error */
    } finally {
      setReleasing(null);
    }
  }

  if (!address) {
    return (
      <Container className="py-12">
        <SectionHeading title="Dashboard" subtitle="Your agent, services, and escrow jobs" />
        <Card className="flex flex-col items-center gap-4 p-12 text-center">
          <p className="font-mono text-sm text-zinc-400">Connect your wallet to view your dashboard.</p>
          <Button onClick={connect}>Connect wallet</Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <SectionHeading title="Dashboard" subtitle={`Signed in as ${short(address)}`} />

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        {/* Identity + list a service */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold">Your agent</h3>
            {agentId === null ? (
              <div className="mt-3">
                <Spinner />
              </div>
            ) : agentId > 0 ? (
              <div className="mt-3 flex items-center gap-2">
                <Badge>agent #{agentId}</Badge>
                <span className="font-mono text-xs text-zinc-500">primary identity</span>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="font-mono text-xs text-zinc-500">No identity yet.</p>
                <LinkButton href="/agents" variant="outline">
                  Register an agent →
                </LinkButton>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold">List a service</h3>
            <p className="mt-1 font-mono text-xs text-zinc-500">Publish a paid service to the marketplace.</p>
            <div className="mt-4 space-y-3 font-mono text-sm">
              <input value={cap} onChange={(e) => setCap(e.target.value)} placeholder="capability" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-400/50" />
              <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="endpoint" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-400/50" />
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="price (PHRS)" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-400/50" />
              <Button onClick={doList} disabled={listing || !agentId} className="w-full">
                {listing ? "Listing…" : agentId ? "List service" : "Register an agent first"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Escrow jobs */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Your escrow jobs</h3>
            <button onClick={() => void refresh()} className="font-mono text-xs text-zinc-500 hover:text-white">
              refresh
            </button>
          </div>
          {!ADDR.escrow ? (
            <EmptyState title="No StoaEscrow configured" hint="Set NEXT_PUBLIC_STOA_ESCROW_ADDRESS." />
          ) : loading ? (
            <Spinner label="Loading jobs…" />
          ) : jobs.length === 0 ? (
            <EmptyState title="No escrow jobs yet" hint="Hire an agent from the marketplace to create one." />
          ) : (
            <div className="space-y-3">
              {jobs.map((j) => (
                <Card key={j.jobId} className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge>job #{j.jobId}</Badge>
                      <span
                        className={`font-mono text-xs ${
                          j.state === "Completed" ? "text-emerald-300" : j.state === "Refunded" ? "text-zinc-400" : "text-cyan-300"
                        }`}
                      >
                        {j.state}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-zinc-500">
                      {j.released}/{j.total} PHRS · payee {short(j.payee)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {j.milestones.map((m) => (
                      <div key={m.index} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs">
                        <span className="text-zinc-400">#{m.index}: {m.amount}</span>
                        {m.released ? (
                          <span className="text-emerald-400">released</span>
                        ) : j.state === "Active" ? (
                          <button
                            onClick={() => doRelease(j.jobId, m.index)}
                            disabled={releasing === `${j.jobId}-${m.index}`}
                            className="text-violet-300 hover:text-violet-200 disabled:opacity-50"
                          >
                            {releasing === `${j.jobId}-${m.index}` ? "…" : "release"}
                          </button>
                        ) : (
                          <span className="text-zinc-600">pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {j.state === "Completed" && (
                    <div className="mt-3 border-t border-white/5 pt-3">
                      <Button variant="outline" onClick={() => doRate(j)} disabled={rating === j.jobId} className="text-xs">
                        {rating === j.jobId ? "Rating…" : "Rate provider ★5"}
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
