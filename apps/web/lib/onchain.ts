"use client";
// Real on-chain reads (public RPC) and writes (injected wallet) for the Stoa dashboard.
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatEther,
  parseEther,
  parseEventLogs,
  zeroAddress,
  type Address,
  type Hash,
} from "viem";
import { PHAROS_ATLANTIC } from "./wallet";

export const ADDR = {
  registry: process.env.NEXT_PUBLIC_STOA_REGISTRY_ADDRESS as Address | undefined,
  services: process.env.NEXT_PUBLIC_STOA_SERVICES_ADDRESS as Address | undefined,
  escrow: process.env.NEXT_PUBLIC_STOA_ESCROW_ADDRESS as Address | undefined,
  social: process.env.NEXT_PUBLIC_STOA_SOCIAL_ADDRESS as Address | undefined,
  tipJar: process.env.NEXT_PUBLIC_STOA_TIPJAR_ADDRESS as Address | undefined,
  streaming: process.env.NEXT_PUBLIC_STOA_STREAMING_ADDRESS as Address | undefined,
  subscriptions: process.env.NEXT_PUBLIC_STOA_SUBSCRIPTIONS_ADDRESS as Address | undefined,
  vault: process.env.NEXT_PUBLIC_STOA_VAULT_ADDRESS as Address | undefined,
  arbiterPanel: process.env.NEXT_PUBLIC_STOA_ARBITERPANEL_ADDRESS as Address | undefined,
  rwa: process.env.NEXT_PUBLIC_STOA_RWA_ADDRESS as Address | undefined,
  valueReputation: process.env.NEXT_PUBLIC_STOA_VALUEREPUTATION_ADDRESS as Address | undefined,
};

export const publicClient = createPublicClient({
  chain: PHAROS_ATLANTIC,
  transport: http(PHAROS_ATLANTIC.rpcUrls.default.http[0]),
});

type Eip1193 = { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> };

async function wallet() {
  const eth = (globalThis as { ethereum?: Eip1193 }).ethereum;
  if (!eth) throw new Error("No wallet found. Connect a wallet first.");
  const [account] = (await eth.request({ method: "eth_requestAccounts" })) as Address[];
  if (!account) throw new Error("No account authorized.");
  return createWalletClient({ account, chain: PHAROS_ATLANTIC, transport: custom(eth) });
}

function need(addr: Address | undefined, label: string): Address {
  if (!addr) throw new Error(`${label} address not configured (set NEXT_PUBLIC_STOA_${label.toUpperCase()}_ADDRESS).`);
  return addr;
}

// --- ABIs (minimal) ------------------------------------------------------- //

const registryAbi = [
  { type: "function", name: "register", stateMutability: "nonpayable", inputs: [{ name: "metadataURI", type: "string" }], outputs: [{ name: "agentId", type: "uint256" }] },
  { type: "function", name: "getAgent", stateMutability: "view", inputs: [{ name: "agentId", type: "uint256" }], outputs: [{ name: "owner", type: "address" }, { name: "metadataURI", type: "string" }, { name: "createdAt", type: "uint64" }] },
  { type: "function", name: "reputationOf", stateMutability: "view", inputs: [{ name: "agentId", type: "uint256" }], outputs: [{ name: "count", type: "uint64" }, { name: "scoreSum", type: "int256" }] },
  { type: "function", name: "primaryAgentId", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "attest", stateMutability: "nonpayable", inputs: [{ name: "agentId", type: "uint256" }, { name: "score", type: "int8" }, { name: "uri", type: "string" }], outputs: [] },
  { type: "function", name: "averageScoreX100", stateMutability: "view", inputs: [{ name: "agentId", type: "uint256" }], outputs: [{ name: "", type: "int256" }] },
  { type: "function", name: "nextAgentId", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "event", name: "AgentRegistered", inputs: [{ name: "agentId", type: "uint256", indexed: true }, { name: "owner", type: "address", indexed: true }, { name: "metadataURI", type: "string", indexed: false }] },
  { type: "event", name: "Attested", inputs: [{ name: "agentId", type: "uint256", indexed: true }, { name: "from", type: "address", indexed: true }, { name: "score", type: "int8", indexed: false }, { name: "uri", type: "string", indexed: false }] },
] as const;

const servicesAbi = [
  { type: "function", name: "list", stateMutability: "nonpayable", inputs: [{ name: "agentId", type: "uint256" }, { name: "capability", type: "string" }, { name: "endpoint", type: "string" }, { name: "metadataURI", type: "string" }, { name: "priceWei", type: "uint256" }], outputs: [{ name: "serviceId", type: "uint256" }] },
  { type: "function", name: "servicesByCapability", stateMutability: "view", inputs: [{ name: "capability", type: "string" }], outputs: [{ name: "", type: "uint256[]" }] },
  { type: "function", name: "servicesByProvider", stateMutability: "view", inputs: [{ name: "provider", type: "address" }], outputs: [{ name: "", type: "uint256[]" }] },
  { type: "function", name: "totalServices", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  {
    type: "function", name: "getService", stateMutability: "view", inputs: [{ name: "serviceId", type: "uint256" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "provider", type: "address" }, { name: "agentId", type: "uint256" }, { name: "capability", type: "string" },
      { name: "endpoint", type: "string" }, { name: "metadataURI", type: "string" }, { name: "priceWei", type: "uint256" }, { name: "active", type: "bool" }] }],
  },
  { type: "event", name: "ServiceListed", inputs: [{ name: "serviceId", type: "uint256", indexed: true }, { name: "provider", type: "address", indexed: true }, { name: "capability", type: "string", indexed: false }, { name: "priceWei", type: "uint256", indexed: false }] },
] as const;

const escrowAbi = [
  { type: "function", name: "createJob", stateMutability: "payable", inputs: [{ name: "payee", type: "address" }, { name: "arbiter", type: "address" }, { name: "token", type: "address" }, { name: "deadline", type: "uint64" }, { name: "milestoneAmounts", type: "uint256[]" }], outputs: [{ name: "jobId", type: "uint256" }] },
  { type: "function", name: "release", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }, { name: "index", type: "uint256" }], outputs: [] },
  {
    type: "function", name: "getJob", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      { name: "job", type: "tuple", components: [
        { name: "payer", type: "address" }, { name: "payee", type: "address" }, { name: "arbiter", type: "address" },
        { name: "token", type: "address" }, { name: "deadline", type: "uint64" }, { name: "state", type: "uint8" },
        { name: "total", type: "uint256" }, { name: "released", type: "uint256" }] },
      { name: "milestones", type: "uint256[]" },
      { name: "releasedFlags", type: "bool[]" },
    ],
  },
  { type: "event", name: "JobCreated", inputs: [{ name: "jobId", type: "uint256", indexed: true }, { name: "payer", type: "address", indexed: true }, { name: "payee", type: "address", indexed: true }, { name: "token", type: "address", indexed: false }, { name: "total", type: "uint256", indexed: false }] },
] as const;

const ESCROW_STATE = ["Active", "Completed", "Refunded"] as const;

const socialAbi = [
  { type: "function", name: "post", stateMutability: "nonpayable", inputs: [{ name: "contentURI", type: "string" }], outputs: [{ name: "postId", type: "uint256" }] },
  { type: "function", name: "like", stateMutability: "nonpayable", inputs: [{ name: "postId", type: "uint256" }], outputs: [] },
  { type: "function", name: "follow", stateMutability: "nonpayable", inputs: [{ name: "followee", type: "address" }], outputs: [] },
  { type: "function", name: "totalPosts", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  {
    type: "function", name: "getPost", stateMutability: "view", inputs: [{ name: "postId", type: "uint256" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "author", type: "address" }, { name: "parentId", type: "uint256" }, { name: "contentURI", type: "string" },
      { name: "createdAt", type: "uint64" }, { name: "likes", type: "uint64" }] }],
  },
  { type: "event", name: "Posted", inputs: [{ name: "postId", type: "uint256", indexed: true }, { name: "author", type: "address", indexed: true }, { name: "parentId", type: "uint256", indexed: true }, { name: "contentURI", type: "string", indexed: false }] },
] as const;

const tipJarAbi = [
  { type: "function", name: "tip", stateMutability: "payable", inputs: [{ name: "to", type: "address" }, { name: "memo", type: "string" }], outputs: [] },
  { type: "event", name: "Tipped", inputs: [{ name: "from", type: "address", indexed: true }, { name: "to", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }, { name: "memo", type: "string", indexed: false }] },
] as const;

const streamingAbi = [
  { type: "function", name: "createStream", stateMutability: "payable", inputs: [{ name: "recipient", type: "address" }, { name: "start", type: "uint64" }, { name: "stop", type: "uint64" }], outputs: [{ name: "streamId", type: "uint256" }] },
  { type: "function", name: "cancel", stateMutability: "nonpayable", inputs: [{ name: "streamId", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ name: "streamId", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdrawable", stateMutability: "view", inputs: [{ name: "streamId", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "streamedAmount", stateMutability: "view", inputs: [{ name: "streamId", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "nextStreamId", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  {
    type: "function", name: "getStream", stateMutability: "view", inputs: [{ name: "streamId", type: "uint256" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "sender", type: "address" }, { name: "recipient", type: "address" }, { name: "token", type: "address" },
      { name: "deposit", type: "uint256" }, { name: "withdrawn", type: "uint256" }, { name: "start", type: "uint64" },
      { name: "stop", type: "uint64" }, { name: "cancelled", type: "bool" }] }],
  },
  { type: "event", name: "StreamCreated", inputs: [{ name: "streamId", type: "uint256", indexed: true }, { name: "sender", type: "address", indexed: true }, { name: "recipient", type: "address", indexed: true }, { name: "deposit", type: "uint256", indexed: false }] },
] as const;

const subscriptionAbi = [
  { type: "function", name: "createPlan", stateMutability: "nonpayable", inputs: [{ name: "price", type: "uint256" }, { name: "period", type: "uint64" }], outputs: [{ name: "planId", type: "uint256" }] },
  { type: "function", name: "subscribe", stateMutability: "payable", inputs: [{ name: "planId", type: "uint256" }], outputs: [{ name: "subId", type: "uint256" }] },
  { type: "function", name: "charge", stateMutability: "nonpayable", inputs: [{ name: "subId", type: "uint256" }], outputs: [] },
  { type: "function", name: "cancel", stateMutability: "nonpayable", inputs: [{ name: "subId", type: "uint256" }], outputs: [] },
  { type: "function", name: "topUp", stateMutability: "payable", inputs: [{ name: "subId", type: "uint256" }], outputs: [] },
  { type: "function", name: "plans", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ name: "provider", type: "address" }, { name: "price", type: "uint256" }, { name: "period", type: "uint64" }, { name: "active", type: "bool" }] },
  { type: "function", name: "subs", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ name: "planId", type: "uint256" }, { name: "subscriber", type: "address" }, { name: "balance", type: "uint256" }, { name: "nextCharge", type: "uint64" }, { name: "active", type: "bool" }] },
  { type: "event", name: "PlanCreated", inputs: [{ name: "planId", type: "uint256", indexed: true }, { name: "provider", type: "address", indexed: true }, { name: "price", type: "uint256", indexed: false }, { name: "period", type: "uint64", indexed: false }] },
  { type: "event", name: "Subscribed", inputs: [{ name: "subId", type: "uint256", indexed: true }, { name: "planId", type: "uint256", indexed: true }, { name: "subscriber", type: "address", indexed: true }, { name: "funded", type: "uint256", indexed: false }] },
] as const;

const vaultAbi = [
  { type: "function", name: "submit", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }, { name: "data", type: "bytes" }], outputs: [{ name: "txId", type: "uint256" }] },
  { type: "function", name: "confirm", stateMutability: "nonpayable", inputs: [{ name: "txId", type: "uint256" }], outputs: [] },
  { type: "function", name: "execute", stateMutability: "nonpayable", inputs: [{ name: "txId", type: "uint256" }], outputs: [] },
  { type: "function", name: "getTransaction", stateMutability: "view", inputs: [{ name: "txId", type: "uint256" }], outputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }, { name: "data", type: "bytes" }, { name: "executed", type: "bool" }, { name: "confirmations", type: "uint256" }] },
  { type: "function", name: "threshold", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "ownerCount", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "txCount", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "event", name: "Submitted", inputs: [{ name: "txId", type: "uint256", indexed: true }, { name: "to", type: "address", indexed: true }, { name: "value", type: "uint256", indexed: false }] },
] as const;

const rwaAbi = [
  { type: "function", name: "issue", stateMutability: "nonpayable", inputs: [{ name: "holder", type: "address" }, { name: "assetType", type: "string" }, { name: "valuation", type: "uint256" }, { name: "metadataURI", type: "string" }], outputs: [{ name: "assetId", type: "uint256" }] },
  { type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [{ name: "assetId", type: "uint256" }, { name: "to", type: "address" }], outputs: [] },
  { type: "function", name: "redeem", stateMutability: "nonpayable", inputs: [{ name: "assetId", type: "uint256" }], outputs: [] },
  { type: "function", name: "assetsByHolder", stateMutability: "view", inputs: [{ name: "holder", type: "address" }], outputs: [{ name: "", type: "uint256[]" }] },
  {
    type: "function", name: "getAsset", stateMutability: "view", inputs: [{ name: "assetId", type: "uint256" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "issuer", type: "address" }, { name: "holder", type: "address" }, { name: "assetType", type: "string" },
      { name: "valuation", type: "uint256" }, { name: "metadataURI", type: "string" }, { name: "redeemed", type: "bool" }] }],
  },
  { type: "event", name: "Issued", inputs: [{ name: "assetId", type: "uint256", indexed: true }, { name: "issuer", type: "address", indexed: true }, { name: "holder", type: "address", indexed: true }, { name: "valuation", type: "uint256", indexed: false }] },
] as const;

const arbiterAbi = [
  { type: "function", name: "openCase", stateMutability: "nonpayable", inputs: [{ name: "jobRef", type: "uint256" }, { name: "evidenceURI", type: "string" }], outputs: [{ name: "caseId", type: "uint256" }] },
  { type: "function", name: "vote", stateMutability: "nonpayable", inputs: [{ name: "caseId", type: "uint256" }, { name: "favorPayee", type: "bool" }], outputs: [] },
  { type: "function", name: "getCase", stateMutability: "view", inputs: [{ name: "caseId", type: "uint256" }], outputs: [{ name: "jobRef", type: "uint256" }, { name: "opener", type: "address" }, { name: "evidenceURI", type: "string" }, { name: "votesPayee", type: "uint8" }, { name: "votesPayer", type: "uint8" }, { name: "verdict", type: "uint8" }] },
  { type: "function", name: "caseCount", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "event", name: "CaseOpened", inputs: [{ name: "caseId", type: "uint256", indexed: true }, { name: "jobRef", type: "uint256", indexed: true }, { name: "opener", type: "address", indexed: true }, { name: "evidenceURI", type: "string", indexed: false }] },
] as const;

const valueRepAbi = [
  { type: "function", name: "recordSettlement", stateMutability: "nonpayable", inputs: [{ name: "agentId", type: "uint256" }, { name: "value", type: "uint256" }], outputs: [] },
  { type: "function", name: "scoreOf", stateMutability: "view", inputs: [{ name: "agentId", type: "uint256" }], outputs: [{ name: "totalValue", type: "uint256" }, { name: "jobCount", type: "uint64" }, { name: "averageValue", type: "uint256" }] },
  { type: "event", name: "Settlement", inputs: [{ name: "agentId", type: "uint256", indexed: true }, { name: "from", type: "address", indexed: true }, { name: "value", type: "uint256", indexed: false }] },
] as const;

const ARBITER_VERDICT = ["Pending", "Payee", "Payer"] as const;

// --- Types ---------------------------------------------------------------- //

export interface Service {
  serviceId: number;
  provider: Address;
  agentId: number;
  capability: string;
  endpoint: string;
  price: string;
  active: boolean;
}

export interface AgentInfo {
  agentId: number;
  owner: Address;
  metadataURI: string;
  reputation: { count: number; scoreSum: number };
}

// --- Reads ---------------------------------------------------------------- //

async function getServiceById(services: Address, id: bigint): Promise<Service> {
  const s = (await publicClient.readContract({ address: services, abi: servicesAbi, functionName: "getService", args: [id] })) as {
    provider: Address; agentId: bigint; capability: string; endpoint: string; metadataURI: string; priceWei: bigint; active: boolean;
  };
  return { serviceId: Number(id), provider: s.provider, agentId: Number(s.agentId), capability: s.capability, endpoint: s.endpoint, price: formatEther(s.priceWei), active: s.active };
}

export async function browseServices(capability: string): Promise<Service[]> {
  const services = need(ADDR.services, "services");
  const ids = (await publicClient.readContract({ address: services, abi: servicesAbi, functionName: "servicesByCapability", args: [capability] })) as readonly bigint[];
  return Promise.all(ids.slice(0, 50).map((id) => getServiceById(services, id)));
}

export async function servicesByProvider(provider: Address): Promise<Service[]> {
  const services = need(ADDR.services, "services");
  const ids = (await publicClient.readContract({ address: services, abi: servicesAbi, functionName: "servicesByProvider", args: [provider] })) as readonly bigint[];
  return Promise.all(ids.slice(0, 50).map((id) => getServiceById(services, id)));
}

export async function getAgentById(agentId: number): Promise<AgentInfo | null> {
  const registry = need(ADDR.registry, "registry");
  try {
    const [owner, metadataURI] = (await publicClient.readContract({ address: registry, abi: registryAbi, functionName: "getAgent", args: [BigInt(agentId)] })) as [Address, string, bigint];
    const [count, scoreSum] = (await publicClient.readContract({ address: registry, abi: registryAbi, functionName: "reputationOf", args: [BigInt(agentId)] })) as [bigint, bigint];
    return { agentId, owner, metadataURI, reputation: { count: Number(count), scoreSum: Number(scoreSum) } };
  } catch {
    return null;
  }
}

export interface Attestation {
  from: Address;
  score: number;
  uri: string;
}

export async function reputationHistory(agentId: number): Promise<Attestation[]> {
  const registry = need(ADDR.registry, "registry");
  const logs = await publicClient.getContractEvents({ address: registry, abi: registryAbi, eventName: "Attested", args: { agentId: BigInt(agentId) }, fromBlock: 0n, toBlock: "latest" });
  return logs
    .map((l) => ({ from: l.args.from as Address, score: Number(l.args.score ?? 0), uri: (l.args.uri as string) ?? "" }))
    .reverse();
}

export async function listAgents(limit = 50): Promise<AgentInfo[]> {
  const registry = need(ADDR.registry, "registry");
  const next = (await publicClient.readContract({ address: registry, abi: registryAbi, functionName: "nextAgentId" })) as bigint;
  const total = Number(next) - 1;
  const out: AgentInfo[] = [];
  for (let id = total; id >= 1 && out.length < limit; id--) {
    try {
      const [owner, metadataURI] = (await publicClient.readContract({ address: registry, abi: registryAbi, functionName: "getAgent", args: [BigInt(id)] })) as [Address, string, bigint];
      const [count, scoreSum] = (await publicClient.readContract({ address: registry, abi: registryAbi, functionName: "reputationOf", args: [BigInt(id)] })) as [bigint, bigint];
      out.push({ agentId: id, owner, metadataURI, reputation: { count: Number(count), scoreSum: Number(scoreSum) } });
    } catch {
      /* skip */
    }
  }
  return out;
}

// --- Writes (wallet) ------------------------------------------------------ //

export async function registerAgent(metadataURI: string): Promise<{ hash: Hash; agentId?: number }> {
  const w = await wallet();
  const hash = await w.writeContract({ chain: PHAROS_ATLANTIC, address: need(ADDR.registry, "registry"), abi: registryAbi, functionName: "register", args: [metadataURI] });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const events = parseEventLogs({ abi: registryAbi, logs: receipt.logs, eventName: "AgentRegistered" });
  return { hash, agentId: events[0]?.args.agentId !== undefined ? Number(events[0].args.agentId) : undefined };
}

export async function listService(input: { agentId: number; capability: string; endpoint: string; price: string }): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, address: need(ADDR.services, "services"), abi: servicesAbi, functionName: "list", args: [BigInt(input.agentId), input.capability, input.endpoint, "", parseEther(input.price || "0")] });
}

export async function hireWithEscrow(input: { payee: Address; amountPhrs: string }): Promise<{ hash: Hash; jobId?: number }> {
  const w = await wallet();
  const amount = parseEther(input.amountPhrs);
  const hash = await w.writeContract({ chain: PHAROS_ATLANTIC, address: need(ADDR.escrow, "escrow"), abi: escrowAbi, functionName: "createJob", args: [input.payee, zeroAddress, zeroAddress, 0n, [amount]], value: amount });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const events = parseEventLogs({ abi: escrowAbi, logs: receipt.logs, eventName: "JobCreated" });
  return { hash, jobId: events[0]?.args.jobId !== undefined ? Number(events[0].args.jobId) : undefined };
}

export async function releaseMilestone(jobId: number, index: number): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, address: need(ADDR.escrow, "escrow"), abi: escrowAbi, functionName: "release", args: [BigInt(jobId), BigInt(index)] });
}

export interface X402Result {
  status: number;
  body: unknown;
  txHash?: string;
}

/// Pay an x402-protected endpoint from the browser: probe for the 402 quote, send a real PHRS
/// payment to the `payTo`, then retry with the tx hash as the X-PAYMENT proof to unlock content.
export async function payX402(url: string): Promise<X402Result> {
  const probe = await fetch(url);
  if (probe.status !== 402) {
    return { status: probe.status, body: await probe.json().catch(() => ({})) };
  }
  const challenge = (await probe.json().catch(() => ({}))) as { accepts?: Array<{ payTo?: string }> };
  const payTo = challenge.accepts?.[0]?.payTo as Address | undefined;
  if (!payTo || payTo === zeroAddress) {
    throw new Error("Endpoint has no payTo configured (set X402_PAY_TO on the server).");
  }
  const w = await wallet();
  const txHash = await w.sendTransaction({ chain: PHAROS_ATLANTIC, to: payTo, value: parseEther("0.001") });
  await publicClient.waitForTransactionReceipt({ hash: txHash });
  const paid = await fetch(url, { headers: { "X-PAYMENT": txHash } });
  return { status: paid.status, body: await paid.json().catch(() => ({})), txHash };
}

export async function attestReputation(agentId: number, score: number, uri = ""): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, address: need(ADDR.registry, "registry"), abi: registryAbi, functionName: "attest", args: [BigInt(agentId), score, uri] });
}

export interface Milestone {
  index: number;
  amount: string;
  released: boolean;
}

export interface Job {
  jobId: number;
  payer: Address;
  payee: Address;
  total: string;
  released: string;
  state: string;
  milestones: Milestone[];
}

/// The caller's primary agent id (0 if not registered).
export async function getPrimaryAgentId(owner: Address): Promise<number> {
  if (!ADDR.registry) return 0;
  const id = (await publicClient.readContract({ address: ADDR.registry, abi: registryAbi, functionName: "primaryAgentId", args: [owner] })) as bigint;
  return Number(id);
}

/// Escrow jobs where `payer` is the funder, most-recent first.
export async function myJobs(payer: Address): Promise<Job[]> {
  const escrow = need(ADDR.escrow, "escrow");
  const logs = await publicClient.getContractEvents({ address: escrow, abi: escrowAbi, eventName: "JobCreated", args: { payer }, fromBlock: 0n, toBlock: "latest" });
  const out: Job[] = [];
  for (const l of logs.slice(-50)) {
    const jobId = Number(l.args.jobId ?? 0n);
    const [job, milestones, flags] = (await publicClient.readContract({ address: escrow, abi: escrowAbi, functionName: "getJob", args: [BigInt(jobId)] })) as [
      { payer: Address; payee: Address; total: bigint; released: bigint; state: number },
      readonly bigint[],
      readonly boolean[],
    ];
    out.push({
      jobId,
      payer: job.payer,
      payee: job.payee,
      total: formatEther(job.total),
      released: formatEther(job.released),
      state: ESCROW_STATE[Number(job.state)] ?? "?",
      milestones: milestones.map((m, i) => ({ index: i, amount: formatEther(m), released: flags[i] ?? false })),
    });
  }
  return out.reverse();
}

// --- Social + tipping ----------------------------------------------------- //

export interface Post {
  postId: number;
  author: Address;
  contentURI: string;
  likes: number;
  createdAt: number;
}

export async function getFeed(limit = 30): Promise<Post[]> {
  const social = need(ADDR.social, "social");
  const total = Number(
    (await publicClient.readContract({ address: social, abi: socialAbi, functionName: "totalPosts" })) as bigint,
  );
  const out: Post[] = [];
  for (let id = total; id >= 1 && out.length < limit; id--) {
    try {
      const p = (await publicClient.readContract({ address: social, abi: socialAbi, functionName: "getPost", args: [BigInt(id)] })) as {
        author: Address; parentId: bigint; contentURI: string; createdAt: bigint; likes: bigint;
      };
      out.push({ postId: id, author: p.author, contentURI: p.contentURI, likes: Number(p.likes), createdAt: Number(p.createdAt) });
    } catch {
      /* skip */
    }
  }
  return out;
}

export async function socialPost(contentURI: string): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, address: need(ADDR.social, "social"), abi: socialAbi, functionName: "post", args: [contentURI] });
}

export async function likePost(postId: number): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, address: need(ADDR.social, "social"), abi: socialAbi, functionName: "like", args: [BigInt(postId)] });
}

export async function followAgent(followee: Address): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, address: need(ADDR.social, "social"), abi: socialAbi, functionName: "follow", args: [followee] });
}

export async function tip(to: Address, amountPhrs: string, memo = ""): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, address: need(ADDR.tipJar, "tipjar"), abi: tipJarAbi, functionName: "tip", args: [to, memo], value: parseEther(amountPhrs) });
}

// --- Cross-contract activity feed ----------------------------------------- //

export interface Activity {
  kind: string;
  summary: string;
  blockNumber: number;
  txHash: string;
}

export async function getActivity(): Promise<Activity[]> {
  const items: Activity[] = [];
  const push = (kind: string, summary: string, log: { blockNumber: bigint; transactionHash: string }) =>
    items.push({ kind, summary, blockNumber: Number(log.blockNumber), txHash: log.transactionHash });

  const tasks: Array<Promise<void>> = [];

  if (ADDR.registry) {
    tasks.push(
      publicClient
        .getContractEvents({ address: ADDR.registry, abi: registryAbi, eventName: "AgentRegistered", fromBlock: 0n, toBlock: "latest" })
        .then((logs) => logs.forEach((l) => push("identity", `agent #${Number(l.args.agentId ?? 0n)} registered`, l)))
        .catch(() => {}),
    );
  }
  if (ADDR.services) {
    tasks.push(
      publicClient
        .getContractEvents({ address: ADDR.services, abi: servicesAbi, eventName: "ServiceListed", fromBlock: 0n, toBlock: "latest" })
        .then((logs) => logs.forEach((l) => push("service", `service "${l.args.capability}" listed`, l)))
        .catch(() => {}),
    );
  }
  if (ADDR.escrow) {
    tasks.push(
      publicClient
        .getContractEvents({ address: ADDR.escrow, abi: escrowAbi, eventName: "JobCreated", fromBlock: 0n, toBlock: "latest" })
        .then((logs) => logs.forEach((l) => push("escrow", `job #${Number(l.args.jobId ?? 0n)} · ${formatEther((l.args.total as bigint) ?? 0n)} PHRS`, l)))
        .catch(() => {}),
    );
  }
  if (ADDR.social) {
    tasks.push(
      publicClient
        .getContractEvents({ address: ADDR.social, abi: socialAbi, eventName: "Posted", fromBlock: 0n, toBlock: "latest" })
        .then((logs) => logs.forEach((l) => push("social", `post #${Number(l.args.postId ?? 0n)}`, l)))
        .catch(() => {}),
    );
  }
  if (ADDR.tipJar) {
    tasks.push(
      publicClient
        .getContractEvents({ address: ADDR.tipJar, abi: tipJarAbi, eventName: "Tipped", fromBlock: 0n, toBlock: "latest" })
        .then((logs) => logs.forEach((l) => push("tip", `tip of ${formatEther((l.args.amount as bigint) ?? 0n)} PHRS`, l)))
        .catch(() => {}),
    );
  }

  await Promise.all(tasks);
  return items.sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 60);
}

// --- Streaming ------------------------------------------------------------ //

export interface Stream {
  streamId: number;
  sender: Address;
  recipient: Address;
  deposit: string;
  withdrawn: string;
  withdrawable: string;
  start: number;
  stop: number;
  cancelled: boolean;
}

export async function createStream(
  recipient: Address,
  amountPhrs: string,
  start: number,
  stop: number,
): Promise<{ hash: Hash; streamId?: number }> {
  const w = await wallet();
  const value = parseEther(amountPhrs);
  const hash = await w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.streaming, "streaming"), abi: streamingAbi, functionName: "createStream", args: [recipient, BigInt(start), BigInt(stop)], value });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const events = parseEventLogs({ abi: streamingAbi, logs: receipt.logs, eventName: "StreamCreated" });
  return { hash, streamId: events[0]?.args.streamId !== undefined ? Number(events[0].args.streamId) : undefined };
}

export async function myStreams(sender: Address): Promise<Stream[]> {
  const streaming = need(ADDR.streaming, "streaming");
  const [sent, received] = await Promise.all([
    publicClient.getContractEvents({ address: streaming, abi: streamingAbi, eventName: "StreamCreated", args: { sender }, fromBlock: 0n, toBlock: "latest" }),
    publicClient.getContractEvents({ address: streaming, abi: streamingAbi, eventName: "StreamCreated", args: { recipient: sender }, fromBlock: 0n, toBlock: "latest" }),
  ]);
  const logs = [...sent, ...received];
  const seen = new Set<string>();
  const out: Stream[] = [];
  for (const l of logs.slice(-50)) {
    const streamId = Number(l.args.streamId ?? 0n);
    if (seen.has(String(streamId))) continue;
    seen.add(String(streamId));
    try {
      const s = (await publicClient.readContract({ address: streaming, abi: streamingAbi, functionName: "getStream", args: [BigInt(streamId)] })) as {
        sender: Address; recipient: Address; token: Address; deposit: bigint; withdrawn: bigint; start: bigint; stop: bigint; cancelled: boolean;
      };
      const wd = (await publicClient.readContract({ address: streaming, abi: streamingAbi, functionName: "withdrawable", args: [BigInt(streamId)] })) as bigint;
      out.push({
        streamId,
        sender: s.sender,
        recipient: s.recipient,
        deposit: formatEther(s.deposit),
        withdrawn: formatEther(s.withdrawn),
        withdrawable: formatEther(wd),
        start: Number(s.start),
        stop: Number(s.stop),
        cancelled: s.cancelled,
      });
    } catch {
      /* skip */
    }
  }
  return out.reverse();
}

export async function streamWithdraw(streamId: number, amountPhrs: string): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.streaming, "streaming"), abi: streamingAbi, functionName: "withdraw", args: [BigInt(streamId), parseEther(amountPhrs)] });
}

export async function streamCancel(streamId: number): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.streaming, "streaming"), abi: streamingAbi, functionName: "cancel", args: [BigInt(streamId)] });
}

// --- Subscriptions -------------------------------------------------------- //

export interface Sub {
  subId: number;
  planId: number;
  subscriber: Address;
  balance: string;
  nextCharge: number;
  active: boolean;
}

export async function createPlan(pricePhrs: string, periodSecs: number): Promise<{ hash: Hash; planId?: number }> {
  const w = await wallet();
  const hash = await w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.subscriptions, "subscriptions"), abi: subscriptionAbi, functionName: "createPlan", args: [parseEther(pricePhrs), BigInt(periodSecs)] });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const events = parseEventLogs({ abi: subscriptionAbi, logs: receipt.logs, eventName: "PlanCreated" });
  return { hash, planId: events[0]?.args.planId !== undefined ? Number(events[0].args.planId) : undefined };
}

export async function subscribe(planId: number, fundPhrs: string): Promise<{ hash: Hash; subId?: number }> {
  const w = await wallet();
  const hash = await w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.subscriptions, "subscriptions"), abi: subscriptionAbi, functionName: "subscribe", args: [BigInt(planId)], value: parseEther(fundPhrs) });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const events = parseEventLogs({ abi: subscriptionAbi, logs: receipt.logs, eventName: "Subscribed" });
  return { hash, subId: events[0]?.args.subId !== undefined ? Number(events[0].args.subId) : undefined };
}

export async function mySubscriptions(subscriber: Address): Promise<Sub[]> {
  const subscriptions = need(ADDR.subscriptions, "subscriptions");
  const logs = await publicClient.getContractEvents({ address: subscriptions, abi: subscriptionAbi, eventName: "Subscribed", args: { subscriber }, fromBlock: 0n, toBlock: "latest" });
  const out: Sub[] = [];
  for (const l of logs.slice(-50)) {
    const subId = Number(l.args.subId ?? 0n);
    try {
      const [planId, sub, balance, nextCharge, active] = (await publicClient.readContract({ address: subscriptions, abi: subscriptionAbi, functionName: "subs", args: [BigInt(subId)] })) as [bigint, Address, bigint, bigint, boolean];
      out.push({ subId, planId: Number(planId), subscriber: sub, balance: formatEther(balance), nextCharge: Number(nextCharge), active });
    } catch {
      /* skip */
    }
  }
  return out.reverse();
}

export async function chargeSub(subId: number): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.subscriptions, "subscriptions"), abi: subscriptionAbi, functionName: "charge", args: [BigInt(subId)] });
}

export async function cancelSub(subId: number): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.subscriptions, "subscriptions"), abi: subscriptionAbi, functionName: "cancel", args: [BigInt(subId)] });
}

// --- Vault (multisig) ----------------------------------------------------- //

export interface VaultTx {
  txId: number;
  to: Address;
  value: string;
  executed: boolean;
  confirmations: number;
}

export interface VaultInfo {
  threshold: number;
  ownerCount: number;
  txCount: number;
}

export async function vaultSubmit(to: Address, valuePhrs: string): Promise<{ hash: Hash; txId?: number }> {
  const w = await wallet();
  const hash = await w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.vault, "vault"), abi: vaultAbi, functionName: "submit", args: [to, parseEther(valuePhrs), "0x"] });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const events = parseEventLogs({ abi: vaultAbi, logs: receipt.logs, eventName: "Submitted" });
  return { hash, txId: events[0]?.args.txId !== undefined ? Number(events[0].args.txId) : undefined };
}

export async function vaultConfirm(txId: number): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.vault, "vault"), abi: vaultAbi, functionName: "confirm", args: [BigInt(txId)] });
}

export async function vaultExecute(txId: number): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.vault, "vault"), abi: vaultAbi, functionName: "execute", args: [BigInt(txId)] });
}

export async function vaultInfo(): Promise<VaultInfo> {
  const vault = need(ADDR.vault, "vault");
  const [threshold, ownerCount, txCount] = await Promise.all([
    publicClient.readContract({ address: vault, abi: vaultAbi, functionName: "threshold" }) as Promise<bigint>,
    publicClient.readContract({ address: vault, abi: vaultAbi, functionName: "ownerCount" }) as Promise<bigint>,
    publicClient.readContract({ address: vault, abi: vaultAbi, functionName: "txCount" }) as Promise<bigint>,
  ]);
  return { threshold: Number(threshold), ownerCount: Number(ownerCount), txCount: Number(txCount) };
}

export async function vaultTxs(): Promise<VaultTx[]> {
  const vault = need(ADDR.vault, "vault");
  const count = Number((await publicClient.readContract({ address: vault, abi: vaultAbi, functionName: "txCount" })) as bigint);
  const out: VaultTx[] = [];
  for (let id = count - 1; id >= 0 && out.length < 50; id--) {
    try {
      const [to, value, , executed, confirmations] = (await publicClient.readContract({ address: vault, abi: vaultAbi, functionName: "getTransaction", args: [BigInt(id)] })) as [Address, bigint, `0x${string}`, boolean, bigint];
      out.push({ txId: id, to, value: formatEther(value), executed, confirmations: Number(confirmations) });
    } catch {
      /* skip */
    }
  }
  return out;
}

// --- RWA registry --------------------------------------------------------- //

export interface Asset {
  assetId: number;
  issuer: Address;
  holder: Address;
  assetType: string;
  valuation: string;
  metadataURI: string;
  redeemed: boolean;
}

export async function rwaIssue(holder: Address, assetType: string, valuation: string, metadataURI: string): Promise<{ hash: Hash; assetId?: number }> {
  const w = await wallet();
  const hash = await w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.rwa, "rwa"), abi: rwaAbi, functionName: "issue", args: [holder, assetType, parseEther(valuation), metadataURI] });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const events = parseEventLogs({ abi: rwaAbi, logs: receipt.logs, eventName: "Issued" });
  return { hash, assetId: events[0]?.args.assetId !== undefined ? Number(events[0].args.assetId) : undefined };
}

export async function myAssets(holder: Address): Promise<Asset[]> {
  const rwa = need(ADDR.rwa, "rwa");
  const ids = (await publicClient.readContract({ address: rwa, abi: rwaAbi, functionName: "assetsByHolder", args: [holder] })) as readonly bigint[];
  const out: Asset[] = [];
  for (const id of ids.slice(0, 50)) {
    try {
      const a = (await publicClient.readContract({ address: rwa, abi: rwaAbi, functionName: "getAsset", args: [id] })) as {
        issuer: Address; holder: Address; assetType: string; valuation: bigint; metadataURI: string; redeemed: boolean;
      };
      out.push({ assetId: Number(id), issuer: a.issuer, holder: a.holder, assetType: a.assetType, valuation: formatEther(a.valuation), metadataURI: a.metadataURI, redeemed: a.redeemed });
    } catch {
      /* skip */
    }
  }
  return out.reverse();
}

export async function rwaTransfer(assetId: number, to: Address): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.rwa, "rwa"), abi: rwaAbi, functionName: "transfer", args: [BigInt(assetId), to] });
}

export async function rwaRedeem(assetId: number): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.rwa, "rwa"), abi: rwaAbi, functionName: "redeem", args: [BigInt(assetId)] });
}

// --- Arbiter panel (disputes) --------------------------------------------- //

export interface Case {
  caseId: number;
  jobRef: number;
  opener: Address;
  evidenceURI: string;
  votesPayee: number;
  votesPayer: number;
  verdict: string;
}

export async function openCase(jobRef: number, evidenceURI: string): Promise<{ hash: Hash; caseId?: number }> {
  const w = await wallet();
  const hash = await w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.arbiterPanel, "arbiterpanel"), abi: arbiterAbi, functionName: "openCase", args: [BigInt(jobRef), evidenceURI] });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const events = parseEventLogs({ abi: arbiterAbi, logs: receipt.logs, eventName: "CaseOpened" });
  return { hash, caseId: events[0]?.args.caseId !== undefined ? Number(events[0].args.caseId) : undefined };
}

export async function voteCase(caseId: number, favorPayee: boolean): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.arbiterPanel, "arbiterpanel"), abi: arbiterAbi, functionName: "vote", args: [BigInt(caseId), favorPayee] });
}

export async function getCase(caseId: number): Promise<Case | null> {
  const arbiterPanel = need(ADDR.arbiterPanel, "arbiterpanel");
  try {
    const [jobRef, opener, evidenceURI, votesPayee, votesPayer, verdict] = (await publicClient.readContract({ address: arbiterPanel, abi: arbiterAbi, functionName: "getCase", args: [BigInt(caseId)] })) as [bigint, Address, string, number, number, number];
    return { caseId, jobRef: Number(jobRef), opener, evidenceURI, votesPayee: Number(votesPayee), votesPayer: Number(votesPayer), verdict: ARBITER_VERDICT[Number(verdict)] ?? "?" };
  } catch {
    return null;
  }
}

// --- Value reputation ----------------------------------------------------- //

export interface ValueScore {
  totalValue: string;
  jobCount: number;
  averageValue: string;
}

export async function recordSettlement(agentId: number, value: string): Promise<Hash> {
  const w = await wallet();
  return w.writeContract({ chain: PHAROS_ATLANTIC, account: w.account, address: need(ADDR.valueReputation, "valuereputation"), abi: valueRepAbi, functionName: "recordSettlement", args: [BigInt(agentId), parseEther(value)] });
}

export async function valueScore(agentId: number): Promise<ValueScore> {
  const valueReputation = need(ADDR.valueReputation, "valuereputation");
  const [totalValue, jobCount, averageValue] = (await publicClient.readContract({ address: valueReputation, abi: valueRepAbi, functionName: "scoreOf", args: [BigInt(agentId)] })) as [bigint, bigint, bigint];
  return { totalValue: formatEther(totalValue), jobCount: Number(jobCount), averageValue: formatEther(averageValue) };
}
