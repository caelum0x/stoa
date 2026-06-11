import type { Action } from "../../types.js";
import { hexToBytesAction } from "./hexToBytes.js";
import { bytesToHexAction } from "./bytesToHex.js";
import { concatHexAction } from "./concatHex.js";
import { padHexAction } from "./padHex.js";
import { sizeOfAction } from "./sizeOf.js";
import { sliceHexAction } from "./sliceHex.js";
import { trimHexAction } from "./trimHex.js";

export const bytesActions: Action[] = [
  hexToBytesAction,
  bytesToHexAction,
  concatHexAction,
  padHexAction,
  sizeOfAction,
  sliceHexAction,
  trimHexAction,
];

export {
  hexToBytesAction,
  bytesToHexAction,
  concatHexAction,
  padHexAction,
  sizeOfAction,
  sliceHexAction,
  trimHexAction,
};
