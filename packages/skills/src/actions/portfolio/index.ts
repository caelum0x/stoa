import type { Action } from "../../types.js";
import { portfolioAction } from "./portfolio.js";
import { tokenHoldingsAction } from "./holdings.js";

export const portfolioActions: Action[] = [portfolioAction, tokenHoldingsAction];

export { portfolioAction, tokenHoldingsAction };
