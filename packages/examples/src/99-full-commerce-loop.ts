/**
 * The full Stoa agent-commerce loop, narrated for judges:
 *   discover → trust → hire → pay → settle → rate
 *
 * Uses the StoaClient (which wraps the verified skills) with two agents — a buyer (Mercator) and a
 * seller (Atlas). Every step is a real on-chain transaction; tx hashes are printed.
 *
 * Prereqs: a deployment manifest (deployments/<network>.json) + two funded keys.
 *   MERCATOR_BUYER_KEY, MERCATOR_SELLER_KEY, PHAROS_RPC_URL, STOA_*_ADDRESS (or a manifest)
 * Run:     pnpm --filter @stoa/examples demo:full
 */
import { StoaClient, StoaAgent } from "@stoa/sdk";

const C = { dim: "\x1b[2m", green: "\x1b[32m", cyan: "\x1b[36m", bold: "\x1b[1m", reset: "\x1b[0m" };
let step = 0;
const log = (title: string, detail?: Record<string, unknown>) => {
  step += 1;
  console.log(`\n${C.bold}${C.cyan}[${step}] ${title}${C.reset}`);
  for (const [k, v] of Object.entries(detail ?? {})) console.log(`    ${C.dim}${k}:${C.reset} ${v}`);
};

function clientFor(key: string): StoaClient {
  return new StoaClient(
    new StoaAgent({
      privateKey: key as `0x${string}`,
      rpcUrl: process.env.PHAROS_RPC_URL,
      contracts: {
        registry: process.env.STOA_REGISTRY_ADDRESS as `0x${string}` | undefined,
        escrow: process.env.STOA_ESCROW_ADDRESS as `0x${string}` | undefined,
        services: process.env.STOA_SERVICES_ADDRESS as `0x${string}` | undefined,
        social: process.env.STOA_SOCIAL_ADDRESS as `0x${string}` | undefined,
      },
    }),
  );
}

async function main(): Promise<void> {
  const buyer = clientFor(process.env.MERCATOR_BUYER_KEY ?? required("MERCATOR_BUYER_KEY"));
  const seller = clientFor(process.env.MERCATOR_SELLER_KEY ?? required("MERCATOR_SELLER_KEY"));

  console.log(`${C.bold}${C.cyan}Stoa — Agent Commerce Loop${C.reset}  (discover → trust → hire → pay → settle → rate)`);

  // 1) Seller registers identity and lists a paid service.
  const sellerId = await seller.registerAgent('data:application/json,{"name":"Atlas","skill":"research"}');
  log("Seller (Atlas) registered identity", { agentId: sellerId.agentId, tx: sellerId.txHash });

  const listing = await seller.listService({
    capability: "research",
    endpoint: "https://atlas.example/x402/summary",
    price: "0.01",
    agentId: sellerId.agentId,
  });
  log("Seller listed an x402-paid service", { serviceId: listing.serviceId, tx: listing.txHash });

  // 2) Buyer discovers the seller and checks reputation.
  const found = await buyer.discoverServices("research");
  log("Buyer discovered services", { capability: "research", serviceIds: found.serviceIds.join(", ") });

  const rep = await buyer.getReputation(sellerId.agentId ?? 1);
  log("Buyer checked seller reputation", { count: rep.count, averageX100: rep.averageX100 });

  // 3) Buyer hires the seller via milestone escrow.
  const job = await buyer.createEscrow({ payee: seller.address, milestones: ["0.001"] });
  log("Buyer created escrow job", { jobId: job.jobId, tx: job.txHash });

  // 4) Buyer pays the seller's x402 endpoint (skipped unless a facilitator is configured).
  if (process.env.X402_FACILITATOR_URL) {
    const paid = await buyer.payX402("https://atlas.example/x402/summary", "0.05");
    log("Buyer paid the x402 endpoint", { status: (paid as { status?: number }).status });
  } else {
    log("Buyer pays x402 endpoint", { skipped: "set X402_FACILITATOR_URL to enable" });
  }

  // 5) Buyer releases escrow on delivery.
  const release = await buyer.releaseEscrow(job.jobId ?? 1, 0);
  log("Buyer released escrow milestone", { tx: release.txHash });

  // 6) Buyer rates the seller.
  const rated = await buyer.writeReputation(sellerId.agentId ?? 1, 5, `stoa:job/${job.jobId}`);
  log("Buyer wrote a reputation attestation", { score: 5, tx: rated.txHash });

  console.log(`\n${C.green}${C.bold}✓ Commerce loop complete — discover → trust → hire → pay → settle → rate${C.reset}\n`);
}

function required(name: string): never {
  throw new Error(`${name} is required to run the full commerce loop.`);
}

main().catch((e) => {
  console.error(`\x1b[31m${e instanceof Error ? e.message : String(e)}\x1b[0m`);
  process.exit(1);
});
