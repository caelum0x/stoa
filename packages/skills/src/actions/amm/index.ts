import type { Action } from "../../types.js";
import { ammAmountOutAction } from "./amountOut.js";
import { ammAmountInAction } from "./amountIn.js";
import { ammQuoteAction } from "./quote.js";

export const ammActions: Action[] = [
  ammAmountOutAction,
  ammAmountInAction,
  ammQuoteAction,
];

export {
  ammAmountOutAction,
  ammAmountInAction,
  ammQuoteAction,
};
