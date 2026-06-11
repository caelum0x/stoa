import type { Action } from "../../types.js";
import { tipSendAction } from "./send.js";
import { tipWithdrawAction } from "./withdraw.js";
import { tipStatsAction } from "./stats.js";

export const tipActions: Action[] = [
  tipSendAction,
  tipWithdrawAction,
  tipStatsAction,
];

export {
  tipSendAction,
  tipWithdrawAction,
  tipStatsAction,
};
