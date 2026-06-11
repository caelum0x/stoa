// @stoa/sdk — pre-flight balance simulation.
//
// Reads the agent's native balance and compares it against a requested amount so
// callers can avoid submitting a transfer that would revert for insufficient funds.

import type { StoaAgent } from "@stoa/skills";

/// Return true when the agent's native balance covers `amountWei`.
export async function canAfford(agent: StoaAgent, amountWei: bigint): Promise<boolean> {
  const balance = await agent.publicClient.getBalance({
    address: agent.account.address,
  });

  return balance >= amountWei;
}
