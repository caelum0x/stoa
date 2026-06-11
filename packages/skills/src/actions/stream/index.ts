import type { Action } from "../../types.js";
import { streamCreateAction } from "./create.js";
import { streamWithdrawAction } from "./withdraw.js";
import { streamCancelAction } from "./cancel.js";
import { streamGetAction } from "./get.js";
import { streamWithdrawableAction } from "./withdrawable.js";

export const streamActions: Action[] = [
  streamCreateAction,
  streamWithdrawAction,
  streamCancelAction,
  streamGetAction,
  streamWithdrawableAction,
];

export {
  streamCreateAction,
  streamWithdrawAction,
  streamCancelAction,
  streamGetAction,
  streamWithdrawableAction,
};
