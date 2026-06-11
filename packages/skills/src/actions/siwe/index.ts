import type { Action } from "../../types.js";
import { buildAuthMessageAction } from "./build.js";
import { signAuthMessageAction } from "./sign.js";

export const siweActions: Action[] = [buildAuthMessageAction, signAuthMessageAction];

export { buildAuthMessageAction, signAuthMessageAction };
