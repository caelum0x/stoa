"use client";
// Dependency-free wallet connection for Pharos Atlantic using viem + an injected EIP-1193 wallet
// (e.g. MetaMask). No wagmi/RainbowKit needed — keeps the app light.
import { createPublicClient, defineChain, http, formatEther, toHex, type Address } from "viem";

export const PHAROS_ATLANTIC = defineChain({
  id: 688689,
  name: "Pharos Atlantic Testnet",
  nativeCurrency: { name: "PHRS", symbol: "PHRS", decimals: 18 },
  rpcUrls: { default: { http: ["https://atlantic.dplabs-internal.com/"] } },
});

type Eip1193 = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };

function injected(): Eip1193 {
  const eth = (globalThis as { ethereum?: Eip1193 }).ethereum;
  if (!eth) throw new Error("No injected wallet found. Install MetaMask or a compatible wallet.");
  return eth;
}

/// Prompt the user to connect and return the selected address.
export async function connectWallet(): Promise<Address> {
  const accounts = (await injected().request({ method: "eth_requestAccounts" })) as Address[];
  const addr = accounts[0];
  if (!addr) throw new Error("No account authorized.");
  return addr;
}

/// Ask the wallet to add / switch to Pharos Atlantic.
export async function switchToPharos(): Promise<void> {
  await injected().request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: toHex(PHAROS_ATLANTIC.id),
        chainName: PHAROS_ATLANTIC.name,
        nativeCurrency: PHAROS_ATLANTIC.nativeCurrency,
        rpcUrls: [...PHAROS_ATLANTIC.rpcUrls.default.http],
      },
    ],
  });
}

/// Read an address's native PHRS balance via the public RPC.
export async function getPhrsBalance(address: Address): Promise<string> {
  const client = createPublicClient({
    chain: PHAROS_ATLANTIC,
    transport: http(PHAROS_ATLANTIC.rpcUrls.default.http[0]),
  });
  const wei = await client.getBalance({ address });
  return formatEther(wei);
}
