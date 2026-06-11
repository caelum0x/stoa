import type { Action } from "../../types.js";
import { isAddressAction } from "./isAddress.js";
import { checksumAddressAction } from "./checksumAddress.js";
import { keccakAction } from "./keccak.js";
import { toHexAction } from "./toHex.js";
import { fromHexAction } from "./fromHex.js";
import { parseUnitsAction } from "./parseUnits.js";
import { formatUnitsAction } from "./formatUnits.js";
import { namehashAction } from "./namehash.js";
import { stringToHexAction } from "./stringToHex.js";
import { hexToStringAction } from "./hexToString.js";

export const utilsActions: Action[] = [
  isAddressAction,
  checksumAddressAction,
  keccakAction,
  toHexAction,
  fromHexAction,
  parseUnitsAction,
  formatUnitsAction,
  namehashAction,
  stringToHexAction,
  hexToStringAction,
];

export {
  isAddressAction,
  checksumAddressAction,
  keccakAction,
  toHexAction,
  fromHexAction,
  parseUnitsAction,
  formatUnitsAction,
  namehashAction,
  stringToHexAction,
  hexToStringAction,
};
