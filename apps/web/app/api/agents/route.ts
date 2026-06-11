import { NextResponse } from "next/server";
import { createPublicClient, http, defineChain, type Address } from "viem";
import { PHAROS } from "@/lib/stoa";

export const dynamic = "force-dynamic";

const pharos = defineChain({
  id: PHAROS.chainId,
  name: "Pharos Atlantic",
  nativeCurrency: { name: "PHRS", symbol: "PHRS", decimals: 18 },
  rpcUrls: { default: { http: [PHAROS.rpcUrl] } },
});

const registryAbi = [
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "metadataURI", type: "string", indexed: false },
    ],
  },
] as const;

const DEMO = [
  { agentId: 1, owner: "0xA71A5…demo", metadataURI: "data:application/json,{\"name\":\"Atlas\"}" },
  { agentId: 2, owner: "0x4Erca…demo", metadataURI: "data:application/json,{\"name\":\"Mercator\"}" },
];

/// GET /api/agents — list agents registered in StoaRegistry (on-chain), with a demo fallback.
export async function GET() {
  const registry = process.env.STOA_REGISTRY_ADDRESS as Address | undefined;
  if (!registry) {
    return NextResponse.json({ source: "demo", agents: DEMO });
  }
  try {
    const client = createPublicClient({ chain: pharos, transport: http(PHAROS.rpcUrl) });
    const logs = await client.getContractEvents({
      address: registry,
      abi: registryAbi,
      eventName: "AgentRegistered",
      fromBlock: 0n,
      toBlock: "latest",
    });
    const agents = logs.slice(0, 100).map((l) => ({
      agentId: Number(l.args.agentId ?? 0n),
      owner: l.args.owner,
      metadataURI: l.args.metadataURI,
    }));
    return NextResponse.json({ source: "chain", count: agents.length, agents });
  } catch (e) {
    return NextResponse.json({ source: "demo", note: String(e), agents: DEMO });
  }
}
