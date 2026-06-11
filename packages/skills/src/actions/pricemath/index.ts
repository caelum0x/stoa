import type { Action } from "../../types.js";
import { applyBpsAction } from "./applyBps.js";
import { slippageMinOutAction } from "./slippageMinOut.js";
import { priceFromReservesAction } from "./priceFromReserves.js";

export const pricemathActions: Action[] = [
  applyBpsAction,
  slippageMinOutAction,
  priceFromReservesAction,
];

export { applyBpsAction, slippageMinOutAction, priceFromReservesAction };
