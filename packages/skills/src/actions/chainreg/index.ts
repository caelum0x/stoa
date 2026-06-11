import type { Action } from "../../types.js";
import { listKnownChainsAction } from "./list.js";
import { chainByIdAction } from "./byId.js";

export const chainregActions: Action[] = [listKnownChainsAction, chainByIdAction];

export { listKnownChainsAction, chainByIdAction };
