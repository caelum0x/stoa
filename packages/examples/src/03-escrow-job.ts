/**
 * Example: hire a worker agent through milestone escrow, then release a milestone.
 *
 * Prereqs: MERCATOR_BUYER_KEY (payer), STOA_ESCROW_ADDRESS, PHAROS_RPC_URL.
 *          WORKER_ADDRESS = the payee agent address.
 * Run:     pnpm --filter @stoa/examples escrow
 */
import { StoaAgent, agentEscrowAction } from "@stoa/skills";

async function main(): Promise<void> {
  const worker = process.env.WORKER_ADDRESS as `0x${string}` | undefined;
  if (!worker) throw new Error("WORKER_ADDRESS is required for this example.");

  const buyer = new StoaAgent({
    privateKey: process.env.MERCATOR_BUYER_KEY as `0x${string}`,
    rpcUrl: process.env.PHAROS_RPC_URL,
    contracts: { escrow: process.env.STOA_ESCROW_ADDRESS as `0x${string}` },
  });

  const created = await agentEscrowAction.handler(buyer, {
    op: "create",
    payee: worker,
    token: "native",
    milestones: ["0.001", "0.002"],
  });
  console.log("create →", created);

  const jobId = (created.data as { jobId?: number })?.jobId;
  if (jobId === undefined) return;

  const released = await agentEscrowAction.handler(buyer, { op: "release", jobId, index: 0 });
  console.log("release →", released);

  const job = await agentEscrowAction.handler(buyer, { op: "get", jobId });
  console.log("get →", JSON.stringify(job.data, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
