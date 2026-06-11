import type { Action } from "../types.js";

// Commerce skills (the flagship suite)
import { x402PayAction } from "./x402Pay.js";
import { x402MonetizeAction } from "./x402Monetize.js";
import { agentIdentityAction } from "./agentIdentity.js";
import { reputationAction } from "./reputation.js";
import { agentEscrowAction } from "./agentEscrow.js";
import { treasuryGuardAction } from "./treasuryGuard.js";
import { serviceListingAction } from "./serviceListing.js";

// Domain skill packs
import { chainActions } from "./chain/index.js";
import { tokenActions } from "./token/index.js";
import { nativeActions } from "./native/index.js";
import { walletActions } from "./wallet/index.js";
import { nftActions } from "./nft/index.js";
import { erc1155Actions } from "./erc1155/index.js";
import { contractActions } from "./contract/index.js";
import { utilsActions } from "./utils/index.js";
import { encodingActions } from "./encoding/index.js";
import { defiActions } from "./defi/index.js";
import { portfolioActions } from "./portfolio/index.js";
import { explorerActions } from "./explorer/index.js";
import { socialActions } from "./social/index.js";
import { tipActions } from "./tip/index.js";
import { streamActions } from "./stream/index.js";
import { eventsActions } from "./events/index.js";
import { mathActions } from "./math/index.js";
import { formatActions } from "./format/index.js";
import { validateActions } from "./validate/index.js";
import { keysActions } from "./keys/index.js";
import { typedDataActions } from "./typeddata/index.js";
import { txopsActions } from "./txops/index.js";
import { faucetActions } from "./faucet/index.js";
import { discoveryActions } from "./discovery/index.js";
import { abitoolsActions } from "./abitools/index.js";
import { hashingActions } from "./hashing/index.js";
import { unitsActions } from "./units/index.js";
import { bytesActions } from "./bytes/index.js";
import { accountActions } from "./account/index.js";
import { timeActions } from "./time/index.js";
import { agentcardActions } from "./agentcard/index.js";
import { siweActions } from "./siwe/index.js";

/// The flagship commerce skills — the heart of the agent economy.
export const commerceActions: Action[] = [
  x402PayAction,
  x402MonetizeAction,
  agentIdentityAction,
  reputationAction,
  agentEscrowAction,
  treasuryGuardAction,
  serviceListingAction,
];

/// Every Stoa skill, grouped by domain for documentation/discovery.
export const actionGroups = {
  commerce: commerceActions,
  chain: chainActions,
  token: tokenActions,
  native: nativeActions,
  wallet: walletActions,
  nft: nftActions,
  erc1155: erc1155Actions,
  contract: contractActions,
  utils: utilsActions,
  encoding: encodingActions,
  defi: defiActions,
  portfolio: portfolioActions,
  explorer: explorerActions,
  social: socialActions,
  tip: tipActions,
  stream: streamActions,
  events: eventsActions,
  math: mathActions,
  format: formatActions,
  validate: validateActions,
  keys: keysActions,
  typeddata: typedDataActions,
  txops: txopsActions,
  faucet: faucetActions,
  discovery: discoveryActions,
  abitools: abitoolsActions,
  hashing: hashingActions,
  units: unitsActions,
  bytes: bytesActions,
  account: accountActions,
  time: timeActions,
  agentcard: agentcardActions,
  siwe: siweActions,
} as const;

/// The full, flat Stoa skill suite.
export const actions: Action[] = Object.values(actionGroups).flat();

/// Lookup a skill by its canonical name (e.g. "X402_PAY").
export const actionsByName: Readonly<Record<string, Action>> = Object.freeze(
  Object.fromEntries(actions.map((a) => [a.name, a])),
);

export {
  x402PayAction,
  x402MonetizeAction,
  agentIdentityAction,
  reputationAction,
  agentEscrowAction,
  treasuryGuardAction,
  serviceListingAction,
};
