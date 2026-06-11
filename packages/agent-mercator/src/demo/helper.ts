import { actionsByName } from "@stoa/skills";
import type { StoaAgent } from "@stoa/skills";
import { makeAgent } from "../wallet.js";

/// Demo helper role: a subcontractor the seller pays via x402 to fulfill a job.
///
/// Thin placeholder that wires the real skills (via {@link actionsByName}) without
/// committing to a particular on-chain run; bodies stay minimal but fully typed.
export async function runHelper(agent: StoaAgent, subcontractUrl?: string): Promise<void> {
  console.log(`[helper] standing by to serve data${subcontractUrl ? ` at ${subcontractUrl}` : ""}`);

  const pay = actionsByName.X402_PAY;
  const monetize = actionsByName.X402_MONETIZE;
  console.log(
    `[helper] using skills: ${pay?.name ?? "X402_PAY"}, ${monetize?.name ?? "X402_MONETIZE"}`,
  );
}

/// Convenience entry point building the helper agent from a key.
export async function runHelperFromKey(privateKey: string, subcontractUrl?: string): Promise<void> {
  await runHelper(makeAgent(privateKey), subcontractUrl);
}
