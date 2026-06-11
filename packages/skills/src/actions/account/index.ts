import type { Action } from "../../types.js";
import { getBytecodeAction } from "./bytecode.js";
import { getCodeSizeAction } from "./codeSize.js";
import { isEoaAction } from "./isEoa.js";

export const accountActions: Action[] = [getBytecodeAction, getCodeSizeAction, isEoaAction];

export { getBytecodeAction, getCodeSizeAction, isEoaAction };
