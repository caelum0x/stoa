// @stoa/sdk — typed read helper for the TipJar contract.
//
// `tipJarAbi` is NOT re-exported from @stoa/skills, so a minimal local ABI
// covering the read getters (balance / totalReceived / totalGiven) is inlined
// here. Amounts are returned as human-readable ether strings.

import { formatEther } from "viem";
import type { StoaAgent } from "@stoa/skills";

/// Minimal TipJar ABI — read-only getters used by the SDK.
const tipJarAbi = [
  {
    type: "function",
    name: "balance",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalReceived",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalGiven",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/// Withdrawable balance, lifetime received, and lifetime given for an address.
export interface TipStats {
  balance: string;
  totalReceived: string;
  totalGiven: string;
}

/// Read tip statistics for an address, formatted as ether strings.
export async function tipStats(
  agent: StoaAgent,
  tipJar: `0x${string}`,
  who: `0x${string}`,
): Promise<TipStats> {
  const [balance, totalReceived, totalGiven] = await Promise.all([
    agent.publicClient.readContract({
      address: tipJar,
      abi: tipJarAbi,
      functionName: "balance",
      args: [who],
    }),
    agent.publicClient.readContract({
      address: tipJar,
      abi: tipJarAbi,
      functionName: "totalReceived",
      args: [who],
    }),
    agent.publicClient.readContract({
      address: tipJar,
      abi: tipJarAbi,
      functionName: "totalGiven",
      args: [who],
    }),
  ]);

  return {
    balance: formatEther(balance),
    totalReceived: formatEther(totalReceived),
    totalGiven: formatEther(totalGiven),
  };
}
