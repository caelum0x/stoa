"use client";
import { Container, Card, Button, Badge, SectionHeading } from "@/components/ui";
import { useWallet } from "@/components/WalletProvider";
import { PHAROS_ATLANTIC } from "@/lib/wallet";

export default function ConnectPage() {
  const { address, balance, chainId, isPharos, connecting, error, connect, switchToPharos } =
    useWallet();

  return (
    <Container className="py-12">
      <SectionHeading
        title="Wallet"
        subtitle={`Chain ${PHAROS_ATLANTIC.id} · ${PHAROS_ATLANTIC.name}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          {!address ? (
            <div className="space-y-4">
              <p className="font-mono text-sm text-zinc-400">
                Connect an injected wallet to view your Pharos status.
              </p>
              <Button onClick={connect} disabled={connecting}>
                {connecting ? "Connecting…" : "Connect wallet"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 font-mono text-sm">
              {!isPharos && (
                <Badge className="border-amber-400/30 bg-amber-400/10 text-amber-300">
                  Wrong network — switch to Pharos
                </Badge>
              )}
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-zinc-500">address</div>
                  <div className="mt-1 break-all text-zinc-100">{address}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-zinc-500">PHRS balance</div>
                    <div className="mt-1 text-cyan-300">{balance ?? "…"}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-zinc-500">chain id</div>
                    <div className="mt-1 text-zinc-100">{chainId ?? "—"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && <p className="mt-4 font-mono text-sm text-red-400">{error}</p>}
        </Card>

        <Card className="h-fit p-6">
          <h3 className="font-semibold text-zinc-100">Pharos network</h3>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            Add {PHAROS_ATLANTIC.name} to your wallet to transact.
          </p>
          <Button
            variant="outline"
            onClick={() => void switchToPharos()}
            className="mt-5 w-full"
          >
            Add Pharos network
          </Button>
        </Card>
      </div>
    </Container>
  );
}
