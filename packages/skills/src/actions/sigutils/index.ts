import type { Action } from "../../types.js";
import { parseSignatureAction } from "./parseSignature.js";
import { serializeSignatureAction } from "./serializeSignature.js";
import { recoverPublicKeyAction } from "./recoverPublicKey.js";
import { recoverTypedDataAction } from "./recoverTypedData.js";

export const sigutilsActions: Action[] = [
  parseSignatureAction,
  serializeSignatureAction,
  recoverPublicKeyAction,
  recoverTypedDataAction,
];

export { parseSignatureAction, serializeSignatureAction, recoverPublicKeyAction, recoverTypedDataAction };
