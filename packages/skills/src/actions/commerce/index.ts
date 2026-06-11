// The flagship Stoa commerce skills — the heart of the hackathon submission.
//
// These seven skills are what make Pharos agents into businesses: get paid, pay other agents,
// prove identity, settle work, rate counterparties, and spend safely. The large utility catalog
// (chain/token/nft/defi/…) is supporting infrastructure beneath these.
import type { Action } from "../../types.js";
import { x402PayAction } from "../x402Pay.js";
import { x402MonetizeAction } from "../x402Monetize.js";
import { agentIdentityAction } from "../agentIdentity.js";
import { agentEscrowAction } from "../agentEscrow.js";
import { reputationAction } from "../reputation.js";
import { treasuryGuardAction } from "../treasuryGuard.js";
import { serviceListingAction } from "../serviceListing.js";

export const stoaCommerceSkills: Action[] = [
  x402PayAction,
  x402MonetizeAction,
  agentIdentityAction,
  agentEscrowAction,
  reputationAction,
  treasuryGuardAction,
  serviceListingAction,
];

export {
  x402PayAction,
  x402MonetizeAction,
  agentIdentityAction,
  agentEscrowAction,
  reputationAction,
  treasuryGuardAction,
  serviceListingAction,
};
