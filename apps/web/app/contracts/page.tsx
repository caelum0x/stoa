"use client";

import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { Badge, Button, Card, Container, EmptyState, SectionHeading, Spinner, short } from "@/components/ui";
import { useTx } from "@/components/ToastProvider";
import { useWallet } from "@/components/WalletProvider";
import {
  ADDR,
  cancelSub,
  chargeSub,
  createPlan,
  createStream,
  getCase,
  myAssets,
  myStreams,
  mySubscriptions,
  openCase,
  recordSettlement,
  rwaIssue,
  rwaRedeem,
  rwaTransfer,
  streamCancel,
  streamWithdraw,
  subscribe,
  valueScore,
  vaultConfirm,
  vaultExecute,
  vaultInfo,
  vaultSubmit,
  vaultTxs,
  voteCase,
  type Asset,
  type Case as DisputeCase,
  type Stream,
  type Sub,
  type ValueScore,
  type VaultInfo,
  type VaultTx,
} from "@/lib/onchain";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block font-mono text-xs text-zinc-500">
      <span>{label}</span>
      <input
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-400/50"
      />
    </label>
  );
}

function ContractStatus({ configured }: { configured: boolean }) {
  return configured ? (
    <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300">configured</Badge>
  ) : (
    <Badge className="border-amber-400/30 bg-amber-400/10 text-amber-300">missing address</Badge>
  );
}

export default function ContractsPage() {
  const { address, connect } = useWallet();
  const tx = useTx();
  const [loading, setLoading] = useState(false);

  const [streams, setStreams] = useState<Stream[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vault, setVault] = useState<VaultInfo | null>(null);
  const [vaultRows, setVaultRows] = useState<VaultTx[]>([]);
  const [caseRow, setCaseRow] = useState<DisputeCase | null>(null);
  const [score, setScore] = useState<ValueScore | null>(null);

  const [streamRecipient, setStreamRecipient] = useState("");
  const [streamAmount, setStreamAmount] = useState("0.01");
  const [streamMinutes, setStreamMinutes] = useState("60");
  const [withdrawStreamId, setWithdrawStreamId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("0.001");

  const [planPrice, setPlanPrice] = useState("0.01");
  const [planPeriod, setPlanPeriod] = useState("86400");
  const [subPlanId, setSubPlanId] = useState("");
  const [subFund, setSubFund] = useState("0.02");

  const [vaultTo, setVaultTo] = useState("");
  const [vaultValue, setVaultValue] = useState("0.001");
  const [vaultTxId, setVaultTxId] = useState("");

  const [jobRef, setJobRef] = useState("");
  const [evidence, setEvidence] = useState("ipfs://");
  const [caseId, setCaseId] = useState("");

  const [assetHolder, setAssetHolder] = useState("");
  const [assetType, setAssetType] = useState("invoice");
  const [assetValue, setAssetValue] = useState("100");
  const [assetUri, setAssetUri] = useState("ipfs://");
  const [assetId, setAssetId] = useState("");
  const [assetTo, setAssetTo] = useState("");

  const [repAgentId, setRepAgentId] = useState("");
  const [repValue, setRepValue] = useState("0.01");

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [nextStreams, nextSubs, nextAssets, nextVault, nextVaultRows] = await Promise.all([
        ADDR.streaming ? myStreams(address).catch(() => []) : Promise.resolve([]),
        ADDR.subscriptions ? mySubscriptions(address).catch(() => []) : Promise.resolve([]),
        ADDR.rwa ? myAssets(address).catch(() => []) : Promise.resolve([]),
        ADDR.vault ? vaultInfo().catch(() => null) : Promise.resolve(null),
        ADDR.vault ? vaultTxs().catch(() => []) : Promise.resolve([]),
      ]);
      setStreams(nextStreams);
      setSubs(nextSubs);
      setAssets(nextAssets);
      setVault(nextVault);
      setVaultRows(nextVaultRows);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function run(label: string, fn: () => Promise<unknown>, after = true) {
    await tx(label, fn);
    if (after) await refresh();
  }

  if (!address) {
    return (
      <Container className="py-12">
        <SectionHeading title="Contracts" subtitle="Streaming, subscriptions, vaults, disputes, RWA receipts, and value reputation" />
        <Card className="flex flex-col items-center gap-4 p-12 text-center">
          <p className="font-mono text-sm text-zinc-400">Connect your wallet to use the contract controls.</p>
          <Button onClick={connect}>Connect wallet</Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading title="Contracts" subtitle={`Signed in as ${short(address)}`} />
        <button onClick={() => void refresh()} className="self-start font-mono text-xs text-zinc-500 hover:text-white sm:self-auto">
          {loading ? "refreshing..." : "refresh"}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold">Streaming</h3>
            <ContractStatus configured={Boolean(ADDR.streaming)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="recipient" value={streamRecipient} onChange={setStreamRecipient} placeholder="0x..." />
            <Field label="amount PHRS" value={streamAmount} onChange={setStreamAmount} />
            <Field label="duration minutes" value={streamMinutes} onChange={setStreamMinutes} type="number" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              disabled={!ADDR.streaming}
              onClick={() => {
                const now = Math.floor(Date.now() / 1000);
                const stop = now + Math.max(1, Number(streamMinutes || "0")) * 60;
                return run("Creating stream", () => createStream(streamRecipient as Address, streamAmount, now, stop));
              }}
            >
              Create stream
            </Button>
            <Button
              variant="outline"
              disabled={!ADDR.streaming || !withdrawStreamId}
              onClick={() => run("Withdrawing stream", () => streamWithdraw(Number(withdrawStreamId), withdrawAmount))}
            >
              Withdraw
            </Button>
            <Button
              variant="outline"
              disabled={!ADDR.streaming || !withdrawStreamId}
              onClick={() => run("Cancelling stream", () => streamCancel(Number(withdrawStreamId)))}
            >
              Cancel
            </Button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="stream id" value={withdrawStreamId} onChange={setWithdrawStreamId} type="number" />
            <Field label="withdraw PHRS" value={withdrawAmount} onChange={setWithdrawAmount} />
          </div>
          <div className="mt-5 space-y-2">
            {!ADDR.streaming ? (
              <EmptyState title="Streaming address not configured" hint="Set NEXT_PUBLIC_STOA_STREAMING_ADDRESS." />
            ) : loading ? (
              <Spinner label="Loading streams..." />
            ) : streams.length === 0 ? (
              <p className="font-mono text-xs text-zinc-500">No streams for this wallet.</p>
            ) : (
              streams.map((s) => (
                <div key={s.streamId} className="rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-zinc-200">stream #{s.streamId}</span>
                    <span className={s.cancelled ? "text-zinc-500" : "text-cyan-300"}>{s.cancelled ? "cancelled" : "active"}</span>
                  </div>
                  <div className="mt-1 text-zinc-500">
                    {s.deposit} PHRS · withdrawable {s.withdrawable} · to {short(s.recipient)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold">Subscriptions</h3>
            <ContractStatus configured={Boolean(ADDR.subscriptions)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="plan price PHRS" value={planPrice} onChange={setPlanPrice} />
            <Field label="period seconds" value={planPeriod} onChange={setPlanPeriod} type="number" />
          </div>
          <Button className="mt-3" disabled={!ADDR.subscriptions} onClick={() => run("Creating plan", () => createPlan(planPrice, Number(planPeriod)))}>
            Create plan
          </Button>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="plan id" value={subPlanId} onChange={setSubPlanId} type="number" />
            <Field label="fund PHRS" value={subFund} onChange={setSubFund} />
          </div>
          <Button className="mt-3" disabled={!ADDR.subscriptions || !subPlanId} onClick={() => run("Subscribing", () => subscribe(Number(subPlanId), subFund))}>
            Subscribe
          </Button>
          <div className="mt-5 space-y-2">
            {!ADDR.subscriptions ? (
              <EmptyState title="SubscriptionManager address not configured" hint="Set NEXT_PUBLIC_STOA_SUBSCRIPTIONS_ADDRESS." />
            ) : subs.length === 0 ? (
              <p className="font-mono text-xs text-zinc-500">No subscriptions for this wallet.</p>
            ) : (
              subs.map((s) => (
                <div key={s.subId} className="rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-zinc-200">sub #{s.subId} · plan #{s.planId}</span>
                    <span className={s.active ? "text-emerald-300" : "text-zinc-500"}>{s.active ? "active" : "inactive"}</span>
                  </div>
                  <div className="mt-1 text-zinc-500">balance {s.balance} PHRS</div>
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => run("Charging subscription", () => chargeSub(s.subId))}>
                      Charge
                    </Button>
                    <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => run("Cancelling subscription", () => cancelSub(s.subId))}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold">AgentVault</h3>
            <ContractStatus configured={Boolean(ADDR.vault)} />
          </div>
          {vault && (
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>threshold {vault.threshold}</Badge>
              <Badge>owners {vault.ownerCount}</Badge>
              <Badge>txs {vault.txCount}</Badge>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="to" value={vaultTo} onChange={setVaultTo} placeholder="0x..." />
            <Field label="value PHRS" value={vaultValue} onChange={setVaultValue} />
          </div>
          <Button className="mt-3" disabled={!ADDR.vault} onClick={() => run("Submitting vault transaction", () => vaultSubmit(vaultTo as Address, vaultValue))}>
            Submit transaction
          </Button>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div className="min-w-32 flex-1">
              <Field label="tx id" value={vaultTxId} onChange={setVaultTxId} type="number" />
            </div>
            <Button variant="outline" disabled={!ADDR.vault || !vaultTxId} onClick={() => run("Confirming vault transaction", () => vaultConfirm(Number(vaultTxId)))}>
              Confirm
            </Button>
            <Button variant="outline" disabled={!ADDR.vault || !vaultTxId} onClick={() => run("Executing vault transaction", () => vaultExecute(Number(vaultTxId)))}>
              Execute
            </Button>
          </div>
          <div className="mt-5 space-y-2">
            {!ADDR.vault ? (
              <EmptyState title="AgentVault address not configured" hint="Set NEXT_PUBLIC_STOA_VAULT_ADDRESS." />
            ) : vaultRows.length === 0 ? (
              <p className="font-mono text-xs text-zinc-500">No vault transactions.</p>
            ) : (
              vaultRows.map((row) => (
                <div key={row.txId} className="rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-zinc-200">tx #{row.txId} · {row.value} PHRS</span>
                    <span className={row.executed ? "text-emerald-300" : "text-cyan-300"}>{row.executed ? "executed" : `${row.confirmations} confirmations`}</span>
                  </div>
                  <div className="mt-1 text-zinc-500">to {short(row.to)}</div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold">ArbiterPanel</h3>
            <ContractStatus configured={Boolean(ADDR.arbiterPanel)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="job ref" value={jobRef} onChange={setJobRef} type="number" />
            <Field label="evidence URI" value={evidence} onChange={setEvidence} />
          </div>
          <Button className="mt-3" disabled={!ADDR.arbiterPanel || !jobRef} onClick={() => run("Opening dispute", () => openCase(Number(jobRef), evidence), false)}>
            Open case
          </Button>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div className="min-w-32 flex-1">
              <Field label="case id" value={caseId} onChange={setCaseId} type="number" />
            </div>
            <Button
              variant="outline"
              disabled={!ADDR.arbiterPanel || !caseId}
              onClick={async () => setCaseRow(await getCase(Number(caseId)))}
            >
              Load
            </Button>
            <Button variant="outline" disabled={!ADDR.arbiterPanel || !caseId} onClick={() => run("Voting for payee", () => voteCase(Number(caseId), true), false)}>
              Vote payee
            </Button>
            <Button variant="outline" disabled={!ADDR.arbiterPanel || !caseId} onClick={() => run("Voting for payer", () => voteCase(Number(caseId), false), false)}>
              Vote payer
            </Button>
          </div>
          {!ADDR.arbiterPanel ? (
            <div className="mt-5">
              <EmptyState title="ArbiterPanel address not configured" hint="Set NEXT_PUBLIC_STOA_ARBITERPANEL_ADDRESS." />
            </div>
          ) : caseRow ? (
            <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-xs">
              <div className="text-zinc-200">case #{caseRow.caseId} · {caseRow.verdict}</div>
              <div className="mt-1 text-zinc-500">job #{caseRow.jobRef} · payee {caseRow.votesPayee} · payer {caseRow.votesPayer}</div>
              <div className="mt-1 break-all text-zinc-500">{caseRow.evidenceURI}</div>
            </div>
          ) : (
            <p className="mt-5 font-mono text-xs text-zinc-500">Load a case id to view votes.</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold">RwaRegistry</h3>
            <ContractStatus configured={Boolean(ADDR.rwa)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="holder" value={assetHolder} onChange={setAssetHolder} placeholder="0x..." />
            <Field label="asset type" value={assetType} onChange={setAssetType} />
            <Field label="valuation" value={assetValue} onChange={setAssetValue} />
            <Field label="metadata URI" value={assetUri} onChange={setAssetUri} />
          </div>
          <Button className="mt-3" disabled={!ADDR.rwa} onClick={() => run("Issuing RWA receipt", () => rwaIssue((assetHolder || address) as Address, assetType, assetValue, assetUri))}>
            Issue receipt
          </Button>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="asset id" value={assetId} onChange={setAssetId} type="number" />
            <Field label="transfer to" value={assetTo} onChange={setAssetTo} placeholder="0x..." />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" disabled={!ADDR.rwa || !assetId || !assetTo} onClick={() => run("Transferring RWA receipt", () => rwaTransfer(Number(assetId), assetTo as Address))}>
              Transfer
            </Button>
            <Button variant="outline" disabled={!ADDR.rwa || !assetId} onClick={() => run("Redeeming RWA receipt", () => rwaRedeem(Number(assetId)))}>
              Redeem
            </Button>
          </div>
          <div className="mt-5 space-y-2">
            {!ADDR.rwa ? (
              <EmptyState title="RwaRegistry address not configured" hint="Set NEXT_PUBLIC_STOA_RWA_ADDRESS." />
            ) : assets.length === 0 ? (
              <p className="font-mono text-xs text-zinc-500">No receipts for this wallet.</p>
            ) : (
              assets.map((a) => (
                <div key={a.assetId} className="rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-zinc-200">asset #{a.assetId} · {a.assetType}</span>
                    <span className={a.redeemed ? "text-zinc-500" : "text-emerald-300"}>{a.redeemed ? "redeemed" : "active"}</span>
                  </div>
                  <div className="mt-1 text-zinc-500">valuation {a.valuation} · issuer {short(a.issuer)}</div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold">ValueReputation</h3>
            <ContractStatus configured={Boolean(ADDR.valueReputation)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="agent id" value={repAgentId} onChange={setRepAgentId} type="number" />
            <Field label="settled value PHRS" value={repValue} onChange={setRepValue} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button disabled={!ADDR.valueReputation || !repAgentId} onClick={() => run("Recording settlement value", () => recordSettlement(Number(repAgentId), repValue), false)}>
              Record settlement
            </Button>
            <Button
              variant="outline"
              disabled={!ADDR.valueReputation || !repAgentId}
              onClick={async () => setScore(await valueScore(Number(repAgentId)))}
            >
              Load score
            </Button>
          </div>
          {!ADDR.valueReputation ? (
            <div className="mt-5">
              <EmptyState title="ValueReputation address not configured" hint="Set NEXT_PUBLIC_STOA_VALUEREPUTATION_ADDRESS." />
            </div>
          ) : score ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Badge>total {score.totalValue}</Badge>
              <Badge>jobs {score.jobCount}</Badge>
              <Badge>avg {score.averageValue}</Badge>
            </div>
          ) : (
            <p className="mt-5 font-mono text-xs text-zinc-500">Load an agent id to view value-weighted reputation.</p>
          )}
        </Card>
      </div>
    </Container>
  );
}
