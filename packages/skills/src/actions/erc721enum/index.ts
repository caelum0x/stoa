import type { Action } from "../../types.js";
import { erc721TotalSupplyAction } from "./totalSupply.js";
import { tokenByIndexAction } from "./tokenByIndex.js";
import { tokenOfOwnerByIndexAction } from "./tokenOfOwnerByIndex.js";

export const erc721enumActions: Action[] = [
  erc721TotalSupplyAction,
  tokenByIndexAction,
  tokenOfOwnerByIndexAction,
];

export {
  erc721TotalSupplyAction,
  tokenByIndexAction,
  tokenOfOwnerByIndexAction,
};
