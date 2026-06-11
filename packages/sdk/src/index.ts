// @stoa/sdk — a clean, high-level client for the Pharos agent commerce stack.

export { StoaClient } from "./StoaClient.js";

// Re-export the underlying agent + chain primitives for convenience.
export {
  StoaAgent,
  pharosAtlantic,
  pharosTestnet,
  DEFAULT_CHAIN,
  TEST_USDC,
  manifestToContracts,
  parseManifest,
} from "@stoa/skills";
export type { StoaAgentOptions, StoaContracts, DeploymentManifest } from "@stoa/skills";

// Developer-facing domain types, typed errors, and env helpers.
export type { AgentProfile, ServiceListing, EscrowJob, TreasuryPolicy, StoaConfig } from "./types.js";
export {
  StoaError,
  ContractNotConfiguredError,
  SkillFailedError,
  ValidationError,
} from "./errors.js";
export { loadAddressesFromEnv } from "./addresses.js";
export { loadConfig } from "./config.js";
export type { ResolvedConfig } from "./config.js";

// Low-level, namespaced contract read helpers and integration modules.
export * as registry from "./contracts/registry.js";
export * as escrow from "./contracts/escrow.js";
export * as services from "./contracts/services.js";
export * as tipjar from "./contracts/tipjar.js";
export * as x402 from "./x402/client.js";
export * as x402server from "./x402/server.js";
export type { X402Quote } from "./x402/types.js";
export { isWithinPolicy } from "./treasury/policy.js";
export { canAfford } from "./treasury/simulate.js";
