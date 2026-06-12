/**
 * One-command live deploy of all 13 Stoa contracts to Pharos Atlantic.
 *
 * Deploys via viem from the Foundry build artifacts (packages/contracts/out), then writes:
 *   - deployments/pharos-atlantic.json
 *   - apps/web/.env.local   (NEXT_PUBLIC_STOA_* + server STOA_* + PHAROS_RPC_URL)
 *   - .env.deployed         (STOA_* for the skills/SDK/CLI)
 * and optionally seeds a demo agent + service.
 *
 * Prereqs: PRIVATE_KEY in env (a FUNDED Pharos Atlantic key), and `forge build` already run.
 * Run:     pnpm deploy:live
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createPublicClient, createWalletClient, http, formatEther, parseEther, type Abi, type Hex, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { pharosAtlantic } from "../src/chains.js";

const ROOT = new URL("../../../", import.meta.url);
const RPC = process.env.PHAROS_RPC_URL ?? pharosAtlantic.rpcUrls.default.http[0];

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

function artifact(name: string): { abi: Abi; bytecode: Hex } {
  const url = new URL(`packages/contracts/out/${name}.sol/${name}.json`, ROOT);
  const j = JSON.parse(readFileSync(url, "utf8")) as { abi: Abi; bytecode: { object: Hex } };
  return { abi: j.abi, bytecode: j.bytecode.object };
}

async function main(): Promise<void> {
  loadEnvFile(".env.local");
  loadEnvFile(".env.deploy.local");
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY not set (a funded Pharos Atlantic key).");
  const rpc = process.env.PHAROS_RPC_URL ?? RPC;
  const account = privateKeyToAccount(normalizePrivateKey(pk));
  const transport = http(rpc);
  const pub = createPublicClient({ chain: pharosAtlantic, transport });
  const wallet = createWalletClient({ account, chain: pharosAtlantic, transport });

  const bal = await pub.getBalance({ address: account.address });
  console.log(`Deployer ${account.address} · ${formatEther(bal)} PHRS`);
  if (bal === 0n) {
    throw new Error(`Deployer has 0 PHRS. Fund ${account.address} on Pharos Atlantic, then re-run.`);
  }

  async function deploy(name: string, args: readonly unknown[] = []): Promise<Address> {
    const { abi, bytecode } = artifact(name);
    const hash = await wallet.deployContract({ abi, bytecode, args, account, chain: pharosAtlantic });
    const receipt = await pub.waitForTransactionReceipt({ hash });
    if (!receipt.contractAddress) throw new Error(`${name} deploy produced no address`);
    console.log(`  ${name.padEnd(20)} ${receipt.contractAddress}`);
    return receipt.contractAddress;
  }

  console.log("Deploying 13 contracts…");
  const registry = await deploy("StoaRegistry");
  const escrow = await deploy("StoaEscrow");
  const services = await deploy("ServiceRegistry");
  const social = await deploy("SocialFeed");
  const tipJar = await deploy("TipJar");
  const streaming = await deploy("Streaming");
  const faucet = await deploy("Faucet", [parseEther("0.5"), 43200n]);
  const sessionKeys = await deploy("SessionKeyManager");
  const subscriptions = await deploy("SubscriptionManager");
  const vault = await deploy("AgentVault", [[account.address], 1n]);
  const arbiterPanel = await deploy("ArbiterPanel", [[account.address], 1]);
  const rwa = await deploy("RwaRegistry");
  const valueReputation = await deploy("ValueReputation");

  const contracts = {
    registry, escrow, services, social, tipJar, streaming, faucet,
    sessionKeys, subscriptions, vault, arbiterPanel, rwa, valueReputation,
  };

  // deployments/pharos-atlantic.json
  const manifest = { network: "pharos-atlantic", chainId: pharosAtlantic.id, rpcUrl: rpc, contracts };
  const manifestJson = JSON.stringify(manifest, null, 2);
  mkdirSync(new URL("deployments/", ROOT), { recursive: true });
  mkdirSync(new URL("packages/contracts/deployments/", ROOT), { recursive: true });
  writeFileSync(new URL("deployments/pharos-atlantic.json", ROOT), manifestJson + "\n");
  writeFileSync(new URL("packages/contracts/deployments/pharos-atlantic.json", ROOT), manifestJson + "\n");

  // apps/web/.env.local
  const KEY = (k: keyof typeof contracts) => contracts[k];
  const webEnv = [
    `PHAROS_RPC_URL=${rpc}`,
    `STOA_REGISTRY_ADDRESS=${KEY("registry")}`,
    `STOA_ESCROW_ADDRESS=${KEY("escrow")}`,
    `STOA_SERVICES_ADDRESS=${KEY("services")}`,
    `STOA_SOCIAL_ADDRESS=${KEY("social")}`,
    `STOA_TIPJAR_ADDRESS=${KEY("tipJar")}`,
    `STOA_STREAMING_ADDRESS=${KEY("streaming")}`,
    `STOA_FAUCET_ADDRESS=${KEY("faucet")}`,
    `STOA_SESSIONKEYS_ADDRESS=${KEY("sessionKeys")}`,
    `STOA_SUBSCRIPTIONS_ADDRESS=${KEY("subscriptions")}`,
    `STOA_VAULT_ADDRESS=${KEY("vault")}`,
    `STOA_ARBITERPANEL_ADDRESS=${KEY("arbiterPanel")}`,
    `STOA_RWA_ADDRESS=${KEY("rwa")}`,
    `STOA_VALUEREPUTATION_ADDRESS=${KEY("valueReputation")}`,
    `NEXT_PUBLIC_STOA_REGISTRY_ADDRESS=${KEY("registry")}`,
    `NEXT_PUBLIC_STOA_SERVICES_ADDRESS=${KEY("services")}`,
    `NEXT_PUBLIC_STOA_ESCROW_ADDRESS=${KEY("escrow")}`,
    `NEXT_PUBLIC_STOA_SOCIAL_ADDRESS=${KEY("social")}`,
    `NEXT_PUBLIC_STOA_TIPJAR_ADDRESS=${KEY("tipJar")}`,
    `NEXT_PUBLIC_STOA_STREAMING_ADDRESS=${KEY("streaming")}`,
    `NEXT_PUBLIC_STOA_SUBSCRIPTIONS_ADDRESS=${KEY("subscriptions")}`,
    `NEXT_PUBLIC_STOA_VAULT_ADDRESS=${KEY("vault")}`,
    `NEXT_PUBLIC_STOA_ARBITERPANEL_ADDRESS=${KEY("arbiterPanel")}`,
    `NEXT_PUBLIC_STOA_RWA_ADDRESS=${KEY("rwa")}`,
    `NEXT_PUBLIC_STOA_VALUEREPUTATION_ADDRESS=${KEY("valueReputation")}`,
    `X402_PAY_TO=${account.address}`,
  ].join("\n");
  writeFileSync(new URL("apps/web/.env.local", ROOT), webEnv + "\n");

  // .env.deployed (skills / sdk / cli / mercator)
  const env = [
    `PHAROS_RPC_URL=${rpc}`,
    ...Object.entries(contracts).map(([k, v]) => `STOA_${k.replace(/([A-Z])/g, "_$1").toUpperCase()}_ADDRESS=${v}`),
  ].join("\n");
  writeFileSync(new URL(".env.deployed", ROOT), env + "\n");

  console.log("\nWrote deployments/pharos-atlantic.json, packages/contracts/deployments/pharos-atlantic.json, apps/web/.env.local, .env.deployed");
  console.log("Next: pnpm seed:live   (registers a demo agent + lists a service)");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
