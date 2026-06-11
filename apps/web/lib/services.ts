// Server-only helper that loads agent services from the on-chain ServiceRegistry
// (if configured via env) and otherwise returns a small demo dataset. Shared by
// the /api/services route and the /marketplace page so neither has to do an
// absolute self-fetch. Never throws — on any error it falls back to demo data.

import "server-only";
import { PHAROS } from "./stoa";

export interface ServiceRecord {
  serviceId: number;
  provider: string;
  capability: string;
  endpoint: string;
  price: string;
  demo?: boolean;
}

/// Minimal ServiceRegistry ABI — just what we read here.
const serviceRegistryAbi = [
  {
    type: "function",
    name: "servicesByCapability",
    stateMutability: "view",
    inputs: [{ name: "capability", type: "string" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getService",
    stateMutability: "view",
    inputs: [{ name: "serviceId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "provider", type: "address" },
          { name: "capability", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "price", type: "uint256" },
        ],
      },
    ],
  },
] as const;

function demoServices(capability: string): ServiceRecord[] {
  return [
    {
      serviceId: 1,
      provider: "0x1111111111111111111111111111111111111111",
      capability,
      endpoint: "https://mercator.stoa.dev/api/research",
      price: "0.001 PHRS",
      demo: true,
    },
    {
      serviceId: 2,
      provider: "0x2222222222222222222222222222222222222222",
      capability,
      endpoint: "https://mercator.stoa.dev/api/summarize",
      price: "0.002 PHRS",
      demo: true,
    },
  ];
}

/// Load services for a capability. Reads the chain when STOA_SERVICES_ADDRESS +
/// PHAROS_RPC_URL are set; otherwise returns demo data. Always resolves.
export async function loadServices(capability = "research"): Promise<ServiceRecord[]> {
  const address = process.env.STOA_SERVICES_ADDRESS;
  const rpcUrl = process.env.PHAROS_RPC_URL ?? PHAROS.rpcUrl;

  if (!address) {
    return demoServices(capability);
  }

  try {
    const { createPublicClient, http, formatUnits } = await import("viem");
    const client = createPublicClient({ transport: http(rpcUrl) });

    const ids = (await client.readContract({
      address: address as `0x${string}`,
      abi: serviceRegistryAbi,
      functionName: "servicesByCapability",
      args: [capability],
    })) as bigint[];

    if (!ids || ids.length === 0) return [];

    const services = await Promise.all(
      ids.map(async (id) => {
        const svc = (await client.readContract({
          address: address as `0x${string}`,
          abi: serviceRegistryAbi,
          functionName: "getService",
          args: [id],
        })) as { provider: string; capability: string; endpoint: string; price: bigint };

        return {
          serviceId: Number(id),
          provider: svc.provider,
          capability: svc.capability,
          endpoint: svc.endpoint,
          price: `${formatUnits(svc.price, 18)} PHRS`,
        } satisfies ServiceRecord;
      }),
    );

    return services;
  } catch {
    // On-chain read failed (bad RPC, wrong address, etc.) — degrade to demo.
    return demoServices(capability);
  }
}
