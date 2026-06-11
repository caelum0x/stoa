import type { Action } from "../../types.js";
import { formatTokenAmountAction } from "./tokenAmount.js";
import { formatShortAddressAction } from "./shortAddress.js";
import { formatDurationAction } from "./duration.js";
import { formatTimestampAction } from "./timestamp.js";
import { formatGweiAction } from "./gwei.js";

export const formatActions: Action[] = [
  formatTokenAmountAction,
  formatShortAddressAction,
  formatDurationAction,
  formatTimestampAction,
  formatGweiAction,
];

export {
  formatTokenAmountAction,
  formatShortAddressAction,
  formatDurationAction,
  formatTimestampAction,
  formatGweiAction,
};
