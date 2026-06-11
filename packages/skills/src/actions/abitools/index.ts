import type { Action } from "../../types.js";
import { parseAbiAction } from "./parseAbi.js";
import { parseAbiItemAction } from "./parseAbiItem.js";
import { formatAbiItemAction } from "./formatAbiItem.js";
import { getAbiItemAction } from "./getAbiItem.js";
import { extractFunctionsAction } from "./extractFunctions.js";
import { extractEventsAction } from "./extractEvents.js";

export const abitoolsActions: Action[] = [
  parseAbiAction,
  parseAbiItemAction,
  formatAbiItemAction,
  getAbiItemAction,
  extractFunctionsAction,
  extractEventsAction,
];

export {
  parseAbiAction,
  parseAbiItemAction,
  formatAbiItemAction,
  getAbiItemAction,
  extractFunctionsAction,
  extractEventsAction,
};
