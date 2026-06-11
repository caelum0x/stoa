import type { Action } from "../../types.js";
import { signTypedDataAction } from "./signTypedData.js";
import { hashTypedDataAction } from "./hashTypedData.js";
import { hashMessageAction } from "./hashMessage.js";

export const typedDataActions: Action[] = [
  signTypedDataAction,
  hashTypedDataAction,
  hashMessageAction,
];

export { signTypedDataAction, hashTypedDataAction, hashMessageAction };
