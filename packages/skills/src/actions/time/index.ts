import type { Action } from "../../types.js";
import { unixNowAction } from "./now.js";
import { secondsUntilAction } from "./secondsUntil.js";
import { chainTimeAction } from "./chainTime.js";
import { formatRelativeAction } from "./relative.js";

export const timeActions: Action[] = [
  unixNowAction,
  secondsUntilAction,
  chainTimeAction,
  formatRelativeAction,
];

export { unixNowAction, secondsUntilAction, chainTimeAction, formatRelativeAction };
