/**
 * End-to-end integration: deploys the Stoa contracts to a local anvil node and exercises the
 * real on-chain skills (identity, escrow, reputation, social, tipping) against them.
 *
 * Run via scripts/run-integration.sh (which starts anvil + builds contracts first), or manually:
 *   anvil --silent &              # in another terminal
 *   forge build --root packages/contracts
 *   pnpm --filter @stoa/skills exec tsx scripts/integration.ts
 */
import { readFileSync } from "node:fs";
import { defineChain, type Abi, type Hex } from "viem";
import { StoaAgent, actionsByName } from "../src/index.js";

const RPC = process.env.ANVIL_RPC ?? "http://127.0.0.1:8545";

// Well-known anvil dev accounts (#0 and #1). Never used outside a local node.
const KEY0 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const;
const KEY1 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" as const;

const anvil = defineChain({
  id: 31337,
  name: "Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
});

function artifact(name: string): { abi: Abi; bytecode: Hex } {
  const url = new URL(`../../contracts/out/${name}.sol/${name}.json`, import.meta.url);
  const json = JSON.parse(readFileSync(url, "utf8")) as { abi: Abi; bytecode: { object: Hex } };
  return { abi: json.abi, bytecode: json.bytecode.object };
}

let pass = 0;
let fail = 0;

function check(label: string, ok: boolean, detail?: unknown): void {
  if (ok) {
    pass += 1;
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
  } else {
    fail += 1;
    console.log(`  \x1b[31m✗\x1b[0m ${label} ${detail ? `→ ${JSON.stringify(detail)}` : ""}`);
  }
}

async function main(): Promise<void> {
  const deployer = new StoaAgent({ privateKey: KEY0, chain: anvil, rpcUrl: RPC });

  async function deploy(name: string): Promise<`0x${string}`> {
    const { abi, bytecode } = artifact(name);
    const hash = await deployer.walletClient.deployContract({
      abi,
      bytecode,
      args: [],
      account: deployer.account,
      chain: anvil,
    });
    const receipt = await deployer.publicClient.waitForTransactionReceipt({ hash });
    if (!receipt.contractAddress) throw new Error(`Deploy of ${name} produced no address`);
    return receipt.contractAddress;
  }

  console.log("Deploying contracts to anvil…");
  const registry = await deploy("StoaRegistry");
  const escrow = await deploy("StoaEscrow");
  const social = await deploy("SocialFeed");
  const tipJar = await deploy("TipJar");
  console.log(`  registry=${registry}\n  escrow=${escrow}\n  social=${social}\n  tipJar=${tipJar}\n`);

  const contracts = { registry, escrow, social, tipJar };
  const worker = new StoaAgent({ privateKey: KEY0, chain: anvil, rpcUrl: RPC, contracts });
  const buyer = new StoaAgent({ privateKey: KEY1, chain: anvil, rpcUrl: RPC, contracts });

  console.log("Running skills end-to-end:");

  // 1) Identity
  const reg = await actionsByName.AGENT_IDENTITY!.handler(worker, {
    op: "register",
    metadataURI: "data:application/json,{\"name\":\"Worker\"}",
  });
  check("agent_identity register", reg.status === "success", reg.message);
  const agentId = (reg.data as { agentId?: number })?.agentId ?? 1;

  const resolved = await actionsByName.AGENT_IDENTITY!.handler(buyer, { op: "resolve", agentId });
  check("agent_identity resolve", resolved.status === "success", resolved.message);

  // 2) Escrow: buyer hires worker, then releases
  const job = await actionsByName.AGENT_ESCROW!.handler(buyer, {
    op: "create",
    payee: worker.address,
    token: "native",
    milestones: ["0.001"],
  });
  check("agent_escrow create", job.status === "success", job.message);
  const jobId = (job.data as { jobId?: number })?.jobId ?? 1;

  const release = await actionsByName.AGENT_ESCROW!.handler(buyer, { op: "release", jobId, index: 0 });
  check("agent_escrow release", release.status === "success", release.message);

  // 3) Reputation: buyer attests the worker (cannot self-attest)
  const attest = await actionsByName.REPUTATION!.handler(buyer, {
    op: "attest",
    agentId,
    score: 5,
    uri: `stoa:job/${jobId}`,
  });
  check("reputation attest", attest.status === "success", attest.message);

  const score = await actionsByName.REPUTATION!.handler(worker, { op: "score", agentId });
  check(
    "reputation score reflects attestation",
    score.status === "success" && (score.data as { count?: number })?.count === 1,
    score.data,
  );

  // 4) Social
  const post = await actionsByName.SOCIAL_POST!.handler(worker, {
    contentURI: "data:text/plain,gm from the worker agent",
  });
  check("social_post", post.status === "success", post.message);

  // 5) Tipping
  const tip = await actionsByName.TIP_SEND!.handler(buyer, {
    to: worker.address,
    amount: "0.01",
    memo: "nice work",
  });
  check("tip_send", tip.status === "success", tip.message);

  const stats = await actionsByName.TIP_STATS!.handler(worker, {});
  check("tip_stats", stats.status === "success", stats.message);

  console.log(`\n${fail === 0 ? "\x1b[32m" : "\x1b[31m"}${pass} passed, ${fail} failed\x1b[0m`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Integration run crashed:", e);
  process.exit(1);
});
