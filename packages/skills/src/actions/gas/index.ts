import type { Action } from "../../types.js";
import { estimateFeesAction } from "./estimateFees.js";
import { maxPriorityFeeAction } from "./maxPriorityFee.js";
import { baseFeeAction } from "./baseFee.js";
import { txFeeEstimateAction } from "./txFeeEstimate.js";

export const gasActions: Action[] = [
  estimateFeesAction,
  maxPriorityFeeAction,
  baseFeeAction,
  txFeeEstimateAction,
];

export { estimateFeesAction, maxPriorityFeeAction, baseFeeAction, txFeeEstimateAction };
