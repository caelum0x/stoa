import { actionsByName } from "@stoa/skills";
import type { StoaAgent } from "@stoa/skills";
import { makeAgent } from "../wallet.js";
import { defaultScenario, type CommerceScenario } from "../scenario.js";

/// Demo seller role: registers an identity and lists a paid service behind x402.
///
/// Thin placeholder that wires the real skills (via {@link actionsByName}) without
/// committing to a particular on-chain run; bodies stay minimal but fully typed.
export async function runSeller(
  agent: StoaAgent,
  scenario: CommerceScenario = defaultScenario,
): Promise<void> {
  console.log(`[seller] offering "${scenario.capability}" via x402 paywall`);

  const identity = actionsByName.AGENT_IDENTITY;
  const monetize = actionsByName.X402_MONETIZE;
  console.log(
    `[seller] using skills: ${identity?.name ?? "AGENT_IDENTITY"}, ${monetize?.name ?? "X402_MONETIZE"}`,
  );
}

/// Convenience entry point building the seller agent from a key.
export async function runSellerFromKey(privateKey: string): Promise<void> {
  await runSeller(makeAgent(privateKey));
}
