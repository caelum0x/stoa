"use client";

import { useState } from "react";
import { Container, Card, Button, Badge, SectionHeading, short } from "@/components/ui";
import { useWallet } from "@/components/WalletProvider";
import { payX402 } from "@/lib/onchain";

const URL = "/api/x402/weather";

export default function ProtectedPage() {
  const { address, connect } = useWallet();
  const [status, setStatus] = useState<number | null>(null);
  const [body, setBody] = useState<unknown>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [busy, setBusy] = useState<"probe" | "pay" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function probe() {
    setBusy("probe");
    setError(null);
    setTxHash(null);
    try {
      const res = await fetch(URL);
      setStatus(res.status);
      setBody(await res.json().catch(() => null));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function pay() {
    setBusy("pay");
    setError(null);
    try {
      const r = await payX402(URL);
      setStatus(r.status);
      setBody(r.body);
      setTxHash(r.txHash ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  const is402 = status === 402;
  const is200 = status === 200;

  return (
    <Container className="py-12">
      <SectionHeading title="x402 paid API" subtitle="Pay-per-call HTTP via the x402 payment protocol" />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="flex flex-wrap items-center gap-3 p-6">
            <Button variant="outline" onClick={probe} disabled={busy !== null}>
              {busy === "probe" ? "probing…" : "GET (no payment)"}
            </Button>
            {address ? (
              <Button onClick={pay} disabled={busy !== null}>
                {busy === "pay" ? "paying…" : "Pay 0.001 PHRS & unlock"}
              </Button>
            ) : (
              <Button onClick={connect}>Connect to pay</Button>
            )}
          </Card>

          {error && <Card className="border-red-500/30 p-4 font-mono text-sm text-red-300">{error}</Card>}

          {txHash && (
            <Card className="border-emerald-400/30 p-4 font-mono text-xs text-emerald-300">
              payment tx: {txHash} <span className="text-zinc-500">({short(txHash, 6)})</span>
            </Card>
          )}

          {status !== null && (
            <Card className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Badge
                  className={
                    is402
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                      : is200
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : ""
                  }
                >
                  HTTP {status}
                </Badge>
                <span className="font-mono text-sm text-zinc-500">
                  {is402 ? "Payment Required" : is200 ? "OK · settled" : ""}
                </span>
              </div>
              <pre className="scroll-thin overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-emerald-300">
                {JSON.stringify(body, null, 2)}
              </pre>
            </Card>
          )}
        </div>

        <Card className="h-fit p-6">
          <h3 className="font-semibold text-zinc-100">How it works</h3>
          <ol className="mt-4 space-y-3 font-mono text-xs leading-relaxed text-zinc-400">
            <li>
              <span className="text-violet-300">1 ·</span> Request{" "}
              <code className="text-cyan-300">/api/x402/weather</code> with no payment.
            </li>
            <li>
              <span className="text-violet-300">2 ·</span> Server replies{" "}
              <span className="text-amber-300">402 Payment Required</span> with the <code>payTo</code> + price.
            </li>
            <li>
              <span className="text-violet-300">3 ·</span> Your wallet sends a real PHRS payment, then resends
              with the tx hash as <code className="text-cyan-300">X-PAYMENT</code>.
            </li>
            <li>
              <span className="text-violet-300">4 ·</span> Server returns{" "}
              <span className="text-emerald-300">200 OK</span> with the unlocked data.
            </li>
          </ol>
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-zinc-600">
            Needs <code>X402_PAY_TO</code> set server-side. Production should use EIP-3009 signing via
            <code> @x402/next</code> for gasless settlement.
          </p>
        </Card>
      </div>
    </Container>
  );
}
