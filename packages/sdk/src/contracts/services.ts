// @stoa/sdk — typed read helper for the ServiceRegistry contract.
//
// `serviceRegistryAbi` is NOT re-exported from @stoa/skills, so a minimal local
// ABI covering the reads we need (servicesByCapability + getService) is inlined
// here. Kept as a `const` tuple so viem can infer return types.

import type { StoaAgent } from "@stoa/skills";

/// Minimal ServiceRegistry ABI — read-only surface used by the SDK.
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
          { name: "agentId", type: "uint256" },
          { name: "capability", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "metadataURI", type: "string" },
          { name: "priceWei", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
] as const;

/// Discover the ids of services advertising a given capability.
export async function browse(
  agent: StoaAgent,
  services: `0x${string}`,
  capability: string,
): Promise<number[]> {
  const ids = await agent.publicClient.readContract({
    address: services,
    abi: serviceRegistryAbi,
    functionName: "servicesByCapability",
    args: [capability],
  });

  return ids.map(Number);
}
