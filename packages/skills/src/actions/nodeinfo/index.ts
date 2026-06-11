import type { Action } from "../../types.js";
import { clientVersionAction } from "./clientVersion.js";
import { syncStatusAction } from "./syncStatus.js";
import { chainIdRpcAction } from "./chainIdRpc.js";

export const nodeinfoActions: Action[] = [
  clientVersionAction,
  syncStatusAction,
  chainIdRpcAction,
];

export {
  clientVersionAction,
  syncStatusAction,
  chainIdRpcAction,
};
