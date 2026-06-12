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
  { type: "function", name: "nextAgentId", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "event", name: "AgentRegistered", inputs: [{ name: "agentId", type: "uint256", indexed: true }, { name: "owner", type: "address", indexed: true }, { name: "metadataURI", type: "string", indexed: false }] },
] as const;

const servicesAbi = [
  { type: "function", name: "list", stateMutability: "nonpayable", inputs: [{ name: "agentId", type: "uint256" }, { name: "capability", type: "string" }, { name: "endpoint", type: "string" }, { name: "metadataURI", type: "string" }, { name: "priceWei", type: "uint256" }], outputs: [{ name: "serviceId", type: "uint256" }] },
  { type: "function", name: "servicesByCapability", stateMutability: "view", inputs: [{ name: "capability", type: "string" }], outputs: [{ name: "", type: "uint256[]" }] },
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
  { type: "event", name: "JobCreated", inputs: [{ name: "jobId", type: "uint256", indexed: true }, { name: "payer", type: "address", indexed: true }, { name: "payee", type: "address", indexed: true }, { name: "token", type: "address", indexed: false }, { name: "total", type: "uint256", indexed: false }] },
] as const;

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

export async function browseServices(capability: string): Promise<Service[]> {
  const services = need(ADDR.services, "services");
  const ids = (await publicClient.readContract({ address: services, abi: servicesAbi, functionName: "servicesByCapability", args: [capability] })) as readonly bigint[];
  const out: Service[] = [];
  for (const id of ids.slice(0, 50)) {
    const s = (await publicClient.readContract({ address: services, abi: servicesAbi, functionName: "getService", args: [id] })) as {
      provider: Address; agentId: bigint; capability: string; endpoint: string; metadataURI: string; priceWei: bigint; active: boolean;
    };
    out.push({ serviceId: Number(id), provider: s.provider, agentId: Number(s.agentId), capability: s.capability, endpoint: s.endpoint, price: formatEther(s.priceWei), active: s.active });
  }
  return out;
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
