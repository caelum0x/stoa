import type { Action } from "../../types.js";
import { sessionDepositAction } from "./deposit.js";
import { sessionAuthorizeAction } from "./authorize.js";
import { sessionRevokeAction } from "./revoke.js";
import { sessionSpendAction } from "./spend.js";
import { sessionWithdrawAction } from "./withdraw.js";
import { sessionAllowanceAction } from "./allowance.js";

export const sessionkeyActions: Action[] = [
  sessionDepositAction,
  sessionAuthorizeAction,
  sessionRevokeAction,
  sessionSpendAction,
  sessionWithdrawAction,
  sessionAllowanceAction,
];

export {
  sessionDepositAction,
  sessionAuthorizeAction,
  sessionRevokeAction,
  sessionSpendAction,
  sessionWithdrawAction,
  sessionAllowanceAction,
};
