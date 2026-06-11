import type { Action } from "../../types.js";
import { erc1155BalanceAction } from "./balance.js";
import { erc1155BalanceBatchAction } from "./balanceBatch.js";
import { erc1155UriAction } from "./uri.js";
import { erc1155IsApprovedForAllAction } from "./isApprovedForAll.js";
import { erc1155SetApprovalForAllAction } from "./setApprovalForAll.js";
import { erc1155SafeTransferAction } from "./safeTransfer.js";

export const erc1155Actions: Action[] = [
  erc1155BalanceAction,
  erc1155BalanceBatchAction,
  erc1155UriAction,
  erc1155IsApprovedForAllAction,
  erc1155SetApprovalForAllAction,
  erc1155SafeTransferAction,
];

export {
  erc1155BalanceAction,
  erc1155BalanceBatchAction,
  erc1155UriAction,
  erc1155IsApprovedForAllAction,
  erc1155SetApprovalForAllAction,
  erc1155SafeTransferAction,
};
