import type { Action } from "../../types.js";
import { sha256Action } from "./sha256.js";
import { ripemd160Action } from "./ripemd160.js";
import { keccakStringAction } from "./keccakString.js";
import { idAction } from "./id.js";

export const hashingActions: Action[] = [
  sha256Action,
  ripemd160Action,
  keccakStringAction,
  idAction,
];

export { sha256Action, ripemd160Action, keccakStringAction, idAction };
