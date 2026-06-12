"use client";
import { useCallback, useEffect, useState } from "react";
import { Container, Card, Badge, Spinner, EmptyState, SectionHeading } from "@/components/ui";
import { EXPLORER } from "@/components/ToastProvider";
import { getActivity, type Activity } from "@/lib/onchain";

const KIND_DOT: Record<string, string> = {
  identity: "bg-violet-400",
  service: "bg-cyan-400",
  escrow: "bg-emerald-400",
  social: "bg-fuchsia-400",
  tip: "bg-amber-400",
};

const KIND_TEXT: Record<string, string> = {
  identity: "text-violet-300",
  service: "text-cyan-300",
  escrow: "text-emerald-300",
  social: "text-fuchsia-300",
  tip: "text-amber-300",
};

export default function ActivityPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setItems(await getActivity());
    } catch {
      setItems([]);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Container className="py-12">
      <div className="mb-7 flex items-start justify-between">
        <SectionHeading title="Activity" subtitle="Live cross-contract activity on Pharos Atlantic" />
        <button onClick={() => void load()} className="font-mono text-xs text-zinc-500 hover:text-white">
          refresh
        </button>
      </div>

      {loading ? (
        <Spinner label="Loading activity…" />
      ) : failed || items.length === 0 ? (
        <EmptyState title="No activity yet" hint="Deploy + set NEXT_PUBLIC_STOA_* addresses to see live events." />
      ) : (
        <div className="relative space-y-4 border-l border-white/10 pl-6">
          {items.map((a, i) => (
            <div key={`${a.txHash}-${i}`} className="relative">
              <span
                className={`absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full ring-4 ring-[#07070b] ${
                  KIND_DOT[a.kind] ?? "bg-zinc-400"
                }`}
              />
              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge className={KIND_TEXT[a.kind] ?? "text-zinc-300"}>{a.kind}</Badge>
                    <span className="font-mono text-sm text-zinc-200">{a.summary}</span>
                  </div>
                  <span className="font-mono text-xs text-zinc-600">block #{a.blockNumber}</span>
                </div>
                <a
                  href={`${EXPLORER}/tx/${a.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-mono text-xs text-cyan-400 hover:underline"
                >
                  tx →
                </a>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
