/**
 * Example: release a milestone on an existing escrow job (StoaEscrow).
 *
 * The buyer releases funds for a delivered milestone to the seller.
 *
 * Prereqs: STOA_PRIVATE_KEY, STOA_ESCROW_ADDRESS, PHAROS_RPC_URL.
 * Args:    JOB_ID + MILESTONE_INDEX via env or argv (jobId index).
 * Run:     pnpm --filter @stoa/examples exec tsx src/07-release-escrow.ts 1 0
 */
import { StoaClient } from "@stoa/sdk";

async function main(): Promise<void> {
  const client = StoaClient.fromEnv();

  const jobId = Number(process.argv[2] ?? process.env.JOB_ID ?? "1");
  const index = Number(process.argv[3] ?? process.env.MILESTONE_INDEX ?? "0");
  if (!Number.isInteger(jobId) || !Number.isInteger(index)) {
    throw new Error("Provide a valid jobId and milestone index (argv or JOB_ID/MILESTONE_INDEX env).");
  }

  console.log(`Releasing escrow job #${jobId} milestone #${index}…`);
  const release = await client.releaseEscrow(jobId, index);

  console.log("releaseEscrow →", { jobId, index, txHash: release.txHash });
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
