import type { Action } from "../../types.js";
import { hexToNumberAction } from "./hexToNumber.js";
import { numberToHexAction } from "./numberToHex.js";
import { hexToBigIntAction } from "./hexToBigInt.js";
import { boolToHexAction } from "./boolToHex.js";
import { hexToBoolAction } from "./hexToBool.js";

export const convertActions: Action[] = [
  hexToNumberAction,
  numberToHexAction,
  hexToBigIntAction,
  boolToHexAction,
  hexToBoolAction,
];

export { hexToNumberAction, numberToHexAction, hexToBigIntAction, boolToHexAction, hexToBoolAction };
