import { readFileSync } from "node:fs";
import { createPublicClient, http, type Address } from "viem";
import { pharosAtlantic } from "../src/chains.js";

const ROOT = new URL("../../../", import.meta.url);

type Manifest = {
  network: string;
  chainId: number;
  rpcUrl: string;
  contracts: Record<string, Address>;
};

const counterAbi = [
  { type: "function", name: "nextAgentId", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalServices", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalPosts", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

async function main(): Promise<void> {
  const manifest = JSON.parse(
    readFileSync(new URL("deployments/pharos-atlantic.json", ROOT), "utf8"),
  ) as Manifest;

  const client = createPublicClient({
    chain: pharosAtlantic,
    transport: http(manifest.rpcUrl),
  });

  const chainId = await client.getChainId();
  if (chainId !== manifest.chainId) {
    throw new Error(`RPC chain id mismatch: expected ${manifest.chainId}, got ${chainId}`);
  }

  console.log(`${manifest.network} · chain ${chainId}`);

  for (const [name, address] of Object.entries(manifest.contracts)) {
    const bytecode = await client.getBytecode({ address });
    if (!bytecode || bytecode === "0x") {
      throw new Error(`${name} has no bytecode at ${address}`);
    }
    console.log(`${name.padEnd(16)} ${address} bytecode=${(bytecode.length - 2) / 2} bytes`);
  }

  const registry = manifest.contracts.registry;
  const services = manifest.contracts.services;
  const social = manifest.contracts.social;

  const [nextAgentId, totalServices, totalPosts] = await Promise.all([
    client.readContract({ address: registry, abi: counterAbi, functionName: "nextAgentId" }),
    client.readContract({ address: services, abi: counterAbi, functionName: "totalServices" }),
    client.readContract({ address: social, abi: counterAbi, functionName: "totalPosts" }),
  ]);

  console.log(`seed agents=${Number(nextAgentId) - 1}`);
  console.log(`seed services=${totalServices}`);
  console.log(`seed posts=${totalPosts}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
