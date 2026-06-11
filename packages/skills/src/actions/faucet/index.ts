import type { Action } from "../../types.js";
import { faucetDripAction } from "./drip.js";
import { faucetFundAction } from "./fund.js";
import { faucetStatusAction } from "./status.js";

export const faucetActions: Action[] = [
  faucetDripAction,
  faucetFundAction,
  faucetStatusAction,
];

export { faucetDripAction, faucetFundAction, faucetStatusAction };
