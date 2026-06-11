// @stoa/sdk — environment-driven configuration.
//
// Thin, dependency-free helper that reads connection settings from the
// process environment. Kept separate from `StoaConfig` (the public shape in
// types.ts) so SDK consumers can resolve config without importing chain code.

/// Connection configuration resolved from the environment.
export interface ResolvedConfig {
  rpcUrl?: string;
  chainId?: number;
}

/// Read `PHAROS_RPC_URL` and `STOA_CHAIN_ID` from the given environment.
/// `chainId` is coerced with `Number` and omitted when unset or not numeric.
export function loadConfig(env: NodeJS.ProcessEnv = process.env): ResolvedConfig {
  const rpcUrl = env.PHAROS_RPC_URL;
  const rawChainId = env.STOA_CHAIN_ID;
  const chainId = rawChainId === undefined ? undefined : Number(rawChainId);

  return {
    rpcUrl,
    chainId: chainId !== undefined && Number.isFinite(chainId) ? chainId : undefined,
  };
}
