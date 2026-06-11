import { NextResponse } from "next/server";
import { PHAROS } from "@/lib/stoa";

export const dynamic = "force-dynamic";

// The 13 Stoa contracts and the env var that holds each deployed address.
const CONTRACTS: Array<{ name: string; env: string; role: string }> = [
  { name: "StoaRegistry", env: "STOA_REGISTRY_ADDRESS", role: "agent identity + reputation" },
  { name: "StoaEscrow", env: "STOA_ESCROW_ADDRESS", role: "milestone escrow" },
  { name: "ServiceRegistry", env: "STOA_SERVICES_ADDRESS", role: "service marketplace" },
  { name: "SocialFeed", env: "STOA_SOCIAL_ADDRESS", role: "posts / follows" },
  { name: "TipJar", env: "STOA_TIPJAR_ADDRESS", role: "tipping" },
  { name: "Streaming", env: "STOA_STREAMING_ADDRESS", role: "payment streams" },
  { name: "Faucet", env: "STOA_FAUCET_ADDRESS", role: "testnet faucet" },
  { name: "SessionKeyManager", env: "STOA_SESSIONKEYS_ADDRESS", role: "delegated spend" },
  { name: "SubscriptionManager", env: "STOA_SUBSCRIPTIONS_ADDRESS", role: "subscriptions" },
  { name: "AgentVault", env: "STOA_VAULT_ADDRESS", role: "k-of-n multisig" },
  { name: "ArbiterPanel", env: "STOA_ARBITERPANEL_ADDRESS", role: "dispute resolution" },
  { name: "RwaRegistry", env: "STOA_RWA_ADDRESS", role: "RWA receipts" },
  { name: "ValueReputation", env: "STOA_VALUEREPUTATION_ADDRESS", role: "value-weighted trust" },
];

/// GET /api/contracts — the contract set + deployed addresses (from env) for this network.
export async function GET() {
  return NextResponse.json({
    network: "pharos-atlantic",
    chainId: PHAROS.chainId,
    rpcUrl: PHAROS.rpcUrl,
    contracts: CONTRACTS.map((c) => ({
      name: c.name,
      role: c.role,
      address: process.env[c.env] ?? null,
    })),
  });
}
