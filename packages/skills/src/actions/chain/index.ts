import type { Action } from "../../types.js";
import { blockNumberAction } from "./blockNumber.js";
import { gasPriceAction } from "./gasPrice.js";
import { nativeBalanceAction } from "./nativeBalance.js";
import { txStatusAction } from "./txStatus.js";
import { nonceAction } from "./nonce.js";
import { chainInfoAction } from "./chainInfo.js";
import { isContractAction } from "./isContract.js";
import { getBlockAction } from "./getBlock.js";
import { estimateGasAction } from "./estimateGas.js";

export const chainActions: Action[] = [
  blockNumberAction,
  gasPriceAction,
  nativeBalanceAction,
  txStatusAction,
  nonceAction,
  chainInfoAction,
  isContractAction,
  getBlockAction,
  estimateGasAction,
];

export {
  blockNumberAction,
  gasPriceAction,
  nativeBalanceAction,
  txStatusAction,
  nonceAction,
  chainInfoAction,
  isContractAction,
  getBlockAction,
  estimateGasAction,
};
