import type { Action } from "../../types.js";
import { keeperScanAction } from "./scan.js";
import { keeperChargeDueAction } from "./chargeDue.js";

export const keeperActions: Action[] = [keeperScanAction, keeperChargeDueAction];

export { keeperScanAction, keeperChargeDueAction };
