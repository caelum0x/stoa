import type { Action } from "../../types.js";
import { explorerTxUrlAction } from "./txUrl.js";
import { explorerAddressUrlAction } from "./addressUrl.js";
import { explorerBlockUrlAction } from "./blockUrl.js";
import { explorerTokenUrlAction } from "./tokenUrl.js";

export const explorerActions: Action[] = [
  explorerTxUrlAction,
  explorerAddressUrlAction,
  explorerBlockUrlAction,
  explorerTokenUrlAction,
];

export { explorerTxUrlAction, explorerAddressUrlAction, explorerBlockUrlAction, explorerTokenUrlAction };
