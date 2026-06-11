import type { Action } from "../../types.js";
import { priceFeedReadAction } from "./priceFeed.js";
import { vaultTotalAssetsAction } from "./vaultTotalAssets.js";
import { vaultConvertToAssetsAction } from "./vaultConvertToAssets.js";
import { vaultConvertToSharesAction } from "./vaultConvertToShares.js";
import { vaultPreviewRedeemAction } from "./vaultPreviewRedeem.js";
import { univ2ReservesAction } from "./univ2Reserves.js";

export const defiActions: Action[] = [
  priceFeedReadAction,
  vaultTotalAssetsAction,
  vaultConvertToAssetsAction,
  vaultConvertToSharesAction,
  vaultPreviewRedeemAction,
  univ2ReservesAction,
];

export {
  priceFeedReadAction,
  vaultTotalAssetsAction,
  vaultConvertToAssetsAction,
  vaultConvertToSharesAction,
  vaultPreviewRedeemAction,
  univ2ReservesAction,
};
