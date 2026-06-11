import type { Action } from "../../types.js";
import { previewDepositAction } from "./previewDeposit.js";
import { previewMintAction } from "./previewMint.js";
import { maxWithdrawAction } from "./maxWithdraw.js";
import { vaultAssetAction } from "./asset.js";

export const vault4626Actions: Action[] = [
  previewDepositAction,
  previewMintAction,
  maxWithdrawAction,
  vaultAssetAction,
];

export {
  previewDepositAction,
  previewMintAction,
  maxWithdrawAction,
  vaultAssetAction,
};
