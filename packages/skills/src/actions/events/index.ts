import type { Action } from "../../types.js";
import { eventsGetLogsAction } from "./getLogs.js";
import { eventsParseReceiptAction } from "./parseReceipt.js";
import { eventsByContractAction } from "./byContract.js";

export const eventsActions: Action[] = [
  eventsGetLogsAction,
  eventsParseReceiptAction,
  eventsByContractAction,
];

export { eventsGetLogsAction, eventsParseReceiptAction, eventsByContractAction };
