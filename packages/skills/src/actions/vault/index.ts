import type { Action } from "../../types.js";
import { vaultSubmitAction } from "./submit.js";
import { vaultConfirmAction } from "./confirm.js";
import { vaultRevokeAction } from "./revoke.js";
import { vaultExecuteAction } from "./execute.js";
import { vaultGetTxAction } from "./getTx.js";
import { vaultInfoAction } from "./info.js";

export const vaultActions: Action[] = [
  vaultSubmitAction,
  vaultConfirmAction,
  vaultRevokeAction,
  vaultExecuteAction,
  vaultGetTxAction,
  vaultInfoAction,
];

export {
  vaultSubmitAction,
  vaultConfirmAction,
  vaultRevokeAction,
  vaultExecuteAction,
  vaultGetTxAction,
  vaultInfoAction,
};
