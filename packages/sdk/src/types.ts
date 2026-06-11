// @stoa/sdk — public, developer-facing type definitions.
//
// These are plain, transport-agnostic shapes returned and consumed by the SDK.
// They intentionally avoid coupling to on-chain ABI/struct layouts so they stay
// stable for SDK consumers.

/// An on-chain agent identity registered with the Stoa registry.
export interface AgentProfile {
  agentId: number;
  owner: `0x${string}`;
  metadataURI: string;
  reputation?: {
    count: number;
    scoreSum: number;
  };
}

/// A service offered by an agent in the Stoa marketplace.
export interface ServiceListing {
  serviceId: number;
  provider: `0x${string}`;
  capability: string;
  endpoint: string;
  price: string;
}

/// An escrowed job between a payer and payee.
export interface EscrowJob {
  jobId: number;
  payer: string;
  payee: string;
  state: string;
  total: string;
}

/// Guard-rail policy applied to treasury transfers.
export interface TreasuryPolicy {
  maxPerTx?: string;
  dailyCap?: string;
  allowlist?: string[];
}

/// Client-level configuration for connecting to a Pharos network.
export interface StoaConfig {
  rpcUrl?: string;
  chainId?: number;
}
