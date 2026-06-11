import type { Action } from "../../types.js";
import { erc721OwnerOfAction } from "./ownerOf.js";
import { erc721BalanceAction } from "./balance.js";
import { erc721TokenUriAction } from "./tokenUri.js";
import { erc721MetadataAction } from "./metadata.js";
import { erc721TransferAction } from "./transfer.js";
import { erc721ApproveAction } from "./approve.js";
import { erc721SetApprovalForAllAction } from "./setApprovalForAll.js";
import { erc721IsApprovedForAllAction } from "./isApprovedForAll.js";
import { erc721GetApprovedAction } from "./getApproved.js";

export const nftActions: Action[] = [
  erc721OwnerOfAction,
  erc721BalanceAction,
  erc721TokenUriAction,
  erc721MetadataAction,
  erc721TransferAction,
  erc721ApproveAction,
  erc721SetApprovalForAllAction,
  erc721IsApprovedForAllAction,
  erc721GetApprovedAction,
];

export {
  erc721OwnerOfAction,
  erc721BalanceAction,
  erc721TokenUriAction,
  erc721MetadataAction,
  erc721TransferAction,
  erc721ApproveAction,
  erc721SetApprovalForAllAction,
  erc721IsApprovedForAllAction,
  erc721GetApprovedAction,
};
