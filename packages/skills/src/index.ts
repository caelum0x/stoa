// @stoa/skills — composable agent-commerce skills for Pharos.

export { StoaAgent } from "./agent.js";
export type { StoaAgentOptions, StoaContracts } from "./agent.js";

export type { Action, ActionResult, ActionExample, ActionStatus } from "./types.js";
export { ok, fail, errorMessage } from "./types.js";

export {
  pharosAtlantic,
  pharosTestnet,
  DEFAULT_CHAIN,
  KNOWN_CHAINS,
  TEST_USDC,
  x402Network,
} from "./chains.js";

// Skills
export {
  actions,
  actionsByName,
  actionGroups,
  commerceActions,
  x402PayAction,
  x402MonetizeAction,
  agentIdentityAction,
  reputationAction,
  agentEscrowAction,
  treasuryGuardAction,
  serviceListingAction,
} from "./actions/index.js";

// Schemas (useful for downstream validation / typing)
export { x402PaySchema } from "./actions/x402Pay.js";
export { x402MonetizeSchema, closeMonetizedServer } from "./actions/x402Monetize.js";
export { agentIdentitySchema } from "./actions/agentIdentity.js";
export { reputationSchema } from "./actions/reputation.js";
export { agentEscrowSchema } from "./actions/agentEscrow.js";
export { treasuryGuardSchema } from "./actions/treasuryGuard.js";

// Lower-level tools (advanced usage)
export { getX402Quote, parsePaymentRequiredHeader, payAndFetch } from "./tools/x402.js";
export { createMonetizedServer } from "./tools/x402Server.js";

// ABIs
export { stoaRegistryAbi } from "./abi/stoaRegistry.js";
export { stoaEscrowAbi, ESCROW_STATE } from "./abi/stoaEscrow.js";
export { erc20Abi } from "./abi/erc20.js";
