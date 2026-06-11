import type { Action } from "../../types.js";
import { getTransactionAction } from "./getTransaction.js";
import { sendRawAction } from "./sendRaw.js";
import { waitForTxAction } from "./waitForTx.js";

export const txopsActions: Action[] = [getTransactionAction, sendRawAction, waitForTxAction];

export { getTransactionAction, sendRawAction, waitForTxAction };
