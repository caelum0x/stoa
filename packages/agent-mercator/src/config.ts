import { StoaAgent } from "@stoa/skills";

export interface MercatorConfig {
  seller: StoaAgent;
  buyer: StoaAgent;
  facilitatorUrl?: string;
  subcontractUrl?: string;
  hasRegistry: boolean;
  hasEscrow: boolean;
}

function makeAgent(privateKey: string): StoaAgent {
  return new StoaAgent({
    privateKey: privateKey as `0x${string}`,
    rpcUrl: process.env.PHAROS_RPC_URL,
    chainId: process.env.STOA_CHAIN_ID ? Number(process.env.STOA_CHAIN_ID) : undefined,
    contracts: {
      registry: process.env.STOA_REGISTRY_ADDRESS as `0x${string}` | undefined,
      escrow: process.env.STOA_ESCROW_ADDRESS as `0x${string}` | undefined,
    },
  });
}

/// Build the two-agent demo configuration from environment variables.
///   MERCATOR_SELLER_KEY  (required) — the Mercator service agent's key
///   MERCATOR_BUYER_KEY   (required) — the hiring agent's key
///   PHAROS_RPC_URL, STOA_REGISTRY_ADDRESS, STOA_ESCROW_ADDRESS, X402_FACILITATOR_URL, SUBCONTRACT_URL
export function loadConfig(env: NodeJS.ProcessEnv = process.env): MercatorConfig {
  const sellerKey = env.MERCATOR_SELLER_KEY ?? env.STOA_PRIVATE_KEY;
  const buyerKey = env.MERCATOR_BUYER_KEY;
  if (!sellerKey) throw new Error("MERCATOR_SELLER_KEY (or STOA_PRIVATE_KEY) is required.");
  if (!buyerKey) throw new Error("MERCATOR_BUYER_KEY is required (a second funded testnet key).");

  return {
    seller: makeAgent(sellerKey),
    buyer: makeAgent(buyerKey),
    facilitatorUrl: env.X402_FACILITATOR_URL,
    subcontractUrl: env.SUBCONTRACT_URL,
    hasRegistry: Boolean(env.STOA_REGISTRY_ADDRESS),
    hasEscrow: Boolean(env.STOA_ESCROW_ADDRESS),
  };
}
