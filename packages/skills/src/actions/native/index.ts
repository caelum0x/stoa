import type { Action } from "../../types.js";
import { nativeTransferAction } from "./transfer.js";
import { nativeMultisendAction } from "./multisend.js";

export const nativeActions: Action[] = [nativeTransferAction, nativeMultisendAction];

export { nativeTransferAction, nativeMultisendAction };
