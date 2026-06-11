import type { Action } from "../../types.js";
import { defillamaPricesAction } from "./defillamaPrices.js";
import { defillamaTvlAction } from "./defillamaTvl.js";
import { dexscreenerTokenAction } from "./dexscreenerToken.js";
import { dexscreenerSearchAction } from "./dexscreenerSearch.js";

export const marketdataActions: Action[] = [
  defillamaPricesAction,
  defillamaTvlAction,
  dexscreenerTokenAction,
  dexscreenerSearchAction,
];

export { defillamaPricesAction, defillamaTvlAction, dexscreenerTokenAction, dexscreenerSearchAction };
