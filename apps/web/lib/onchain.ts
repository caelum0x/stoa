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
