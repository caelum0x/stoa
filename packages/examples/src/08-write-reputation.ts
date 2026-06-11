/**
 * Example: write a reputation attestation for an agent (StoaSocial).
 *
 * After a completed job, the buyer rates the seller's agent on-chain.
 *
 * Prereqs: STOA_PRIVATE_KEY, STOA_SOCIAL_ADDRESS, PHAROS_RPC_URL.
 * Args:    AGENT_ID + SCORE via env or argv (agentId score).
 * Run:     pnpm --filter @stoa/examples exec tsx src/08-write-reputation.ts 1 5
 */
import { StoaClient } from "@stoa/sdk";

async function main(): Promise<void> {
  const client = StoaClient.fromEnv();

  const agentId = Number(process.argv[2] ?? process.env.AGENT_ID ?? "1");
  const score = Number(process.argv[3] ?? process.env.SCORE ?? "5");
  if (!Number.isInteger(agentId) || !Number.isInteger(score)) {
    throw new Error("Provide a valid agentId and score (argv or AGENT_ID/SCORE env).");
  }

  console.log(`Attesting reputation for agent #${agentId} with score ${score}…`);
  const rated = await client.writeReputation(agentId, score, process.env.REPUTATION_URI);

  console.log("writeReputation →", { agentId, score, txHash: rated.txHash });
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
