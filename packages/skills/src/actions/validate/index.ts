import type { Action } from "../../types.js";
import { isHexAction } from "./isHex.js";
import { isTxHashAction } from "./isTxHash.js";
import { isAddressAction } from "./isAddress.js";
import { isUintAction } from "./isUint.js";
import { isChecksumAction } from "./isChecksum.js";

export const validateActions: Action[] = [
  isHexAction,
  isTxHashAction,
  isAddressAction,
  isUintAction,
  isChecksumAction,
];

export { isHexAction, isTxHashAction, isAddressAction, isUintAction, isChecksumAction };
