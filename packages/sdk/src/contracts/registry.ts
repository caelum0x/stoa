// @stoa/sdk — typed read helpers for the StoaRegistry contract.
//
// Thin wrappers over a StoaAgent's viem public client. They convert on-chain
// bigints into JSON-safe numbers/strings so the results are stable for SDK
// consumers and easy to serialize.

import { stoaRegistryAbi, type StoaAgent } from "@stoa/skills";
import type { AgentProfile } from "../types.js";

/// Read the aggregate reputation of an agent: attestation count and signed score sum.
export async function reputationOf(
  agent: StoaAgent,
  registry: `0x${string}`,
  agentId: number,
): Promise<{ count: number; scoreSum: number }> {
  const [count, scoreSum] = await agent.publicClient.readContract({
    address: registry,
    abi: stoaRegistryAbi,
    functionName: "reputationOf",
    args: [BigInt(agentId)],
  });

  return { count: Number(count), scoreSum: Number(scoreSum) };
}

/// Read a full agent profile (identity + reputation) from the registry.
export async function getAgentProfile(
  agent: StoaAgent,
  registry: `0x${string}`,
  agentId: number,
): Promise<AgentProfile & { createdAt: string }> {
  const [owner, metadataURI, createdAt] = await agent.publicClient.readContract({
    address: registry,
    abi: stoaRegistryAbi,
    functionName: "getAgent",
    args: [BigInt(agentId)],
  });

  const reputation = await reputationOf(agent, registry, agentId);

  return {
    agentId,
    owner,
    metadataURI,
    createdAt: createdAt.toString(),
    reputation,
  };
}
