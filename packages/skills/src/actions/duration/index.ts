import type { Action } from "../../types.js";
import { parseDurationAction } from "./parse.js";
import { humanizeSecondsAction } from "./humanize.js";
import { formatCountdownAction } from "./countdown.js";

export const durationActions: Action[] = [
  parseDurationAction,
  humanizeSecondsAction,
  formatCountdownAction,
];

export { parseDurationAction, humanizeSecondsAction, formatCountdownAction };
