/**
 * Example: the arbiter dispute lifecycle (ArbiterPanel) via @stoa/skills.
 *
 * Opens a dispute over an escrow job, casts an arbiter vote, then reads the verdict.
 * Uses the raw skills (actionsByName) and a StoaAgent built from the environment.
 *
 * Prereqs: STOA_PRIVATE_KEY, STOA_ARBITER_PANEL_ADDRESS, PHAROS_RPC_URL.
 * Args:    JOB_REF + FAVOR_PAYEE via env or argv (jobRef favorPayee).
 * Run:     pnpm --filter @stoa/examples exec tsx src/10-arbiter-dispute.ts 3 true
 */
import { StoaAgent, actionsByName } from "@stoa/skills";

function action(name: string) {
  const found = actionsByName[name];
  if (!found) throw new Error(`Skill ${name} is unavailable.`);
  return found;
}

async function main(): Promise<void> {
  const agent = StoaAgent.fromEnv();
  const jobRef = Number(process.argv[2] ?? process.env.JOB_REF ?? "0");
  const favorPayee = (process.argv[3] ?? process.env.FAVOR_PAYEE ?? "true") === "true";

  const opened = await action("DISPUTE_OPEN").handler(agent, {
    jobRef,
    evidenceURI: process.env.EVIDENCE_URI ?? "ipfs://evidence",
  });
  console.log("DISPUTE_OPEN →", opened);

  const caseId = (opened.data as { caseId?: number })?.caseId ?? 0;
  const voted = await action("DISPUTE_VOTE").handler(agent, { caseId, favorPayee });
  console.log("DISPUTE_VOTE →", voted);

  const result = await action("DISPUTE_GET").handler(agent, { caseId });
  console.log("DISPUTE_GET →", result);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
