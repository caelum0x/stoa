import type { StoaContracts } from "./agent.js";

/// A deployment manifest: the full set of Stoa contract addresses for one network.
/// Written by tooling after `pnpm contracts:deploy`, consumed by `StoaAgent.fromManifest`.
export interface DeploymentManifest {
  network: string;
  chainId: number;
  rpcUrl?: string;
  contracts: {
    registry?: string;
    escrow?: string;
    services?: string;
    social?: string;
    tipJar?: string;
    streaming?: string;
    faucet?: string;
    sessionKeys?: string;
    subscriptions?: string;
    vault?: string;
    arbiterPanel?: string;
  };
}

const HEX_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

/// Validate + normalize a manifest's contracts into the StoaContracts shape, dropping any
/// placeholder ("0x...") or malformed entries so misconfigured addresses fail loudly at use-time
/// rather than producing silent wrong-address calls.
export function manifestToContracts(manifest: DeploymentManifest): StoaContracts {
  const out: StoaContracts = {};
  for (const [key, value] of Object.entries(manifest.contracts)) {
    if (typeof value === "string" && HEX_ADDRESS.test(value)) {
      (out as Record<string, `0x${string}`>)[key] = value as `0x${string}`;
    }
  }
  return out;
}

/// Parse a manifest from a JSON string (e.g. the contents of deployments/<network>.json).
export function parseManifest(json: string): DeploymentManifest {
  const data = JSON.parse(json) as DeploymentManifest;
  if (typeof data.chainId !== "number" || typeof data.contracts !== "object") {
    throw new Error("Invalid deployment manifest: missing chainId or contracts");
  }
  return data;
}
