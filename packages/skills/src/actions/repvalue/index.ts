import type { Action } from "../../types.js";
import { repValueRecordAction } from "./record.js";
import { repValueScoreAction } from "./score.js";

export const repvalueActions: Action[] = [repValueRecordAction, repValueScoreAction];

export { repValueRecordAction, repValueScoreAction };
