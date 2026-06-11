/**
 * Example: send PHRS through the treasury_guard policy layer.
 * Demonstrates allowlist + per-tx ceiling + dry-run simulation.
 *
 * Prereqs: STOA_PRIVATE_KEY, PHAROS_RPC_URL.
 * Run:     pnpm --filter @stoa/examples guard
 */
import { StoaAgent, treasuryGuardAction } from "@stoa/skills";

async function main(): Promise<void> {
  const agent = StoaAgent.fromEnv();
  const recipient = (process.env.GUARD_RECIPIENT as `0x${string}`) ?? agent.address;

  // 1) Blocked: recipient not on allowlist.
  const blocked = await treasuryGuardAction.handler(agent, {
    to: recipient,
    amount: "0.001",
    token: "native",
    allowlist: ["0x000000000000000000000000000000000000dEaD"],
    dryRun: true,
  });
  console.log("blocked (allowlist) →", blocked.status, "-", blocked.message);

  // 2) Allowed dry-run: under per-tx ceiling, recipient permitted.
  const allowed = await treasuryGuardAction.handler(agent, {
    to: recipient,
    amount: "0.001",
    token: "native",
    maxPerTx: "0.01",
    allowlist: [recipient],
    dryRun: true,
  });
  console.log("allowed (dry-run) →", allowed.status, "-", allowed.message);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
