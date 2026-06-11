import type { Action } from "../../types.js";
import { encodeMemoAction } from "./encode.js";
import { decodeMemoAction } from "./decode.js";

export const memoActions: Action[] = [encodeMemoAction, decodeMemoAction];

export { encodeMemoAction, decodeMemoAction };
