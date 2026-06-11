// @stoa/sdk — treasury guard re-exports.
//
// `StoaClient.guardedTransfer` already wraps the on-chain guarded transfer, so
// this module just surfaces the verified guard action and the pure policy helper
// for callers who want the lower-level pieces directly.

export { treasuryGuardAction } from "@stoa/skills";
export { isWithinPolicy } from "./policy.js";
export type { PolicyCheck } from "./policy.js";
export type { TreasuryPolicy } from "../types.js";
