import type { Action } from "../../types.js";
import { erc20BalanceAction } from "./balance.js";
import { erc20TransferAction } from "./transfer.js";
import { erc20ApproveAction } from "./approve.js";
import { erc20AllowanceAction } from "./allowance.js";
import { erc20MetadataAction } from "./metadata.js";
import { erc20TransferFromAction } from "./transferFrom.js";

export const tokenActions: Action[] = [
  erc20BalanceAction,
  erc20TransferAction,
  erc20ApproveAction,
  erc20AllowanceAction,
  erc20MetadataAction,
  erc20TransferFromAction,
];

export {
  erc20BalanceAction,
  erc20TransferAction,
  erc20ApproveAction,
  erc20AllowanceAction,
  erc20MetadataAction,
  erc20TransferFromAction,
};
