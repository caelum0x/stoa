import type { Action } from "../../types.js";
import { getBlockByHashAction } from "./byHash.js";
import { blockTxCountAction } from "./txCount.js";
import { latestBlocksAction } from "./latest.js";

export const blocksActions: Action[] = [getBlockByHashAction, blockTxCountAction, latestBlocksAction];

export { getBlockByHashAction, blockTxCountAction, latestBlocksAction };
