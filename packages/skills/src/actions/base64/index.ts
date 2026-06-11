import type { Action } from "../../types.js";
import { base64EncodeAction } from "./encode.js";
import { base64DecodeAction } from "./decode.js";
import { base64UrlEncodeAction } from "./encodeUrl.js";

export const base64Actions: Action[] = [
  base64EncodeAction,
  base64DecodeAction,
  base64UrlEncodeAction,
];

export {
  base64EncodeAction,
  base64DecodeAction,
  base64UrlEncodeAction,
};
