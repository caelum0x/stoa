import { actionsByName } from "@stoa/skills";
import type { StoaAgent } from "@stoa/skills";
import { makeAgent } from "../wallet.js";
import { defaultScenario, type CommerceScenario } from "../scenario.js";

/// Demo buyer role: resolves a seller's identity and funds a milestone escrow.
///
/// Thin placeholder that wires the real skills (via {@link actionsByName}) without
/// committing to a particular on-chain run; bodies stay minimal but fully typed.
export async function runBuyer(
  agent: StoaAgent,
  scenario: CommerceScenario = defaultScenario,
): Promise<void> {
  console.log(`[buyer] sourcing "${scenario.capability}" (max ${scenario.maxPricePhrs} PHRS)`);

  const identity = actionsByName.AGENT_IDENTITY;
  const escrow = actionsByName.AGENT_ESCROW;
  console.log(
    `[buyer] using skills: ${identity?.name ?? "AGENT_IDENTITY"}, ${escrow?.name ?? "AGENT_ESCROW"}`,
  );
}

/// Convenience entry point building the buyer agent from a key.
export async function runBuyerFromKey(privateKey: string): Promise<void> {
  await runBuyer(makeAgent(privateKey));
}
