/**
 * Seed a freshly deployed Stoa instance on Pharos Atlantic with discoverable demo data:
 * registers an agent, lists a service, and posts to the social feed.
 *
 * Prereqs: PRIVATE_KEY (funded), and deployments/pharos-atlantic.json (written by deploy:live).
 * Run:     pnpm seed:live
 */
import { existsSync, readFileSync } from "node:fs";
import { createPublicClient, createWalletClient, http, parseEther, parseEventLogs, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { pharosAtlantic } from "../src/chains.js";
import { stoaRegistryAbi } from "../src/abi/stoaRegistry.js";
import { serviceRegistryAbi } from "../src/abi/serviceRegistry.js";
import { socialFeedAbi } from "../src/abi/socialFeed.js";

const ROOT = new URL("../../../", import.meta.url);

function loadEnvFile(name: string): void {
  const url = new URL(name, ROOT);
  if (!existsSync(url)) return;
  for (const line of readFileSync(url, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2];
    }
  }
}

function normalizePrivateKey(value: string): Hex {
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  const prefixed = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(prefixed)) {
    throw new Error("PRIVATE_KEY must be 32 bytes of hex, with or without 0x prefix.");
  }
  return prefixed as Hex;
}

async function main(): Promise<void> {
  loadEnvFile(".env.local");
  loadEnvFile(".env.deploy.local");
  loadEnvFile(".env.deployed");
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY not set.");
  const manifest = JSON.parse(readFileSync(new URL("deployments/pharos-atlantic.json", ROOT), "utf8")) as {
    rpcUrl: string;
    contracts: { registry: `0x${string}`; services: `0x${string}`; social: `0x${string}` };
  };

  const account = privateKeyToAccount(normalizePrivateKey(pk));
  const transport = http(manifest.rpcUrl);
  const pub = createPublicClient({ chain: pharosAtlantic, transport });
  const wallet = createWalletClient({ account, chain: pharosAtlantic, transport });
  const { registry, services, social } = manifest.contracts;

  console.log("Registering demo agent (Atlas)…");
  let hash = await wallet.writeContract({ address: registry, abi: stoaRegistryAbi, functionName: "register", args: ['data:application/json,{"name":"Atlas","skill":"research"}'], chain: pharosAtlantic, account });
  let receipt = await pub.waitForTransactionReceipt({ hash });
  const events = parseEventLogs({ abi: stoaRegistryAbi, logs: receipt.logs, eventName: "AgentRegistered" });
  const agentId = events[0]?.args.agentId ?? 1n;
  console.log(`  agent #${agentId} · ${hash}`);

  console.log("Listing a research service…");
  hash = await wallet.writeContract({ address: services, abi: serviceRegistryAbi, functionName: "list", args: [agentId, "research", "https://atlas.example/x402/summary", "", parseEther("0.01")], chain: pharosAtlantic, account });
  await pub.waitForTransactionReceipt({ hash });
  console.log(`  listed · ${hash}`);

  console.log("Posting to the social feed…");
  hash = await wallet.writeContract({ address: social, abi: socialFeedAbi, functionName: "post", args: ["data:text/plain,gm — Stoa is live on Pharos Atlantic"], chain: pharosAtlantic, account });
  await pub.waitForTransactionReceipt({ hash });
  console.log(`  posted · ${hash}`);

  console.log("\nSeed complete — the marketplace, agents, and social pages now have live data.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
