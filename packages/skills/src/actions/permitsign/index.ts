import type { Action } from "../../types.js";
import { buildPermitTypedDataAction } from "./build.js";

export const permitsignActions: Action[] = [buildPermitTypedDataAction];

export { buildPermitTypedDataAction };
