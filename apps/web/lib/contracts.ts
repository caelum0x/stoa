"use client";
// Client-side contract writes through the user's injected wallet (viem custom transport).
// Addresses come from NEXT_PUBLIC_* env vars so they're available in the browser.
import { createWalletClient, custom, type Address, type Hash } from "viem";
import { PHAROS_ATLANTIC } from "./wallet";

type Eip1193 = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };

function injected(): Eip1193 {
  const eth = (globalThis as { ethereum?: Eip1193 }).ethereum;
  if (!eth) throw new Error("No injected wallet found.");
  return eth;
}

async function walletClient() {
  const eth = injected();
  const accounts = (await eth.request({ method: "eth_requestAccounts" })) as Address[];
  const account = accounts[0];
  if (!account) throw new Error("No account authorized.");
  return createWalletClient({ account, chain: PHAROS_ATLANTIC, transport: custom(eth) });
}

const REGISTRY_ABI = [
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [{ name: "metadataURI", type: "string" }],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
] as const;

const SERVICES_ABI = [
  {
    type: "function",
    name: "list",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "capability", type: "string" },
      { name: "endpoint", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "priceWei", type: "uint256" },
    ],
    outputs: [{ name: "serviceId", type: "uint256" }],
  },
] as const;

function addr(envName: string): Address {
  const value = process.env[envName];
  if (!value) throw new Error(`${envName} is not configured (deploy + set NEXT_PUBLIC_* env).`);
  return value as Address;
}

/// Register an agent identity on StoaRegistry via the connected wallet. Returns the tx hash.
export async function registerAgentOnChain(metadataURI: string): Promise<Hash> {
  const wallet = await walletClient();
  return wallet.writeContract({
    address: addr("NEXT_PUBLIC_STOA_REGISTRY_ADDRESS"),
    abi: REGISTRY_ABI,
    functionName: "register",
    args: [metadataURI],
  });
}

/// List a service on ServiceRegistry via the connected wallet. Returns the tx hash.
export async function listServiceOnChain(input: {
  agentId: bigint;
  capability: string;
  endpoint: string;
  metadataURI: string;
  priceWei: bigint;
}): Promise<Hash> {
  const wallet = await walletClient();
  return wallet.writeContract({
    address: addr("NEXT_PUBLIC_STOA_SERVICES_ADDRESS"),
    abi: SERVICES_ABI,
    functionName: "list",
    args: [input.agentId, input.capability, input.endpoint, input.metadataURI, input.priceWei],
  });
}
