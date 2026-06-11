import type { Action } from "../../types.js";
import { keyGeneratePrivateKeyAction } from "./generate.js";
import { keyAddressFromPrivateKeyAction } from "./addressFrom.js";

export const keysActions: Action[] = [
  keyGeneratePrivateKeyAction,
  keyAddressFromPrivateKeyAction,
];

export { keyGeneratePrivateKeyAction, keyAddressFromPrivateKeyAction };
