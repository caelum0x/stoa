import type { Action } from "../../types.js";
import { randomHexAction } from "./hex.js";
import { randomUuidAction } from "./uuid.js";
import { randomBytesAction } from "./bytes.js";

export const randomActions: Action[] = [
  randomHexAction,
  randomUuidAction,
  randomBytesAction,
];

export {
  randomHexAction,
  randomUuidAction,
  randomBytesAction,
};
