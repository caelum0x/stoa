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
