import type { Action } from "../../types.js";
import { nativeBalancesAction } from "./nativeBalances.js";
import { tokenBalancesAction } from "./tokenBalances.js";

export const multibalanceActions: Action[] = [nativeBalancesAction, tokenBalancesAction];

export { nativeBalancesAction, tokenBalancesAction };
