import type { Action } from "../../types.js";
import { encodeParamsAction } from "./encodeParams.js";
import { decodeParamsAction } from "./decodeParams.js";
import { functionSelectorAction } from "./functionSelector.js";
import { eventTopicAction } from "./eventTopic.js";
import { encodeFunctionDataAction } from "./encodeFunctionData.js";
import { decodeFunctionDataAction } from "./decodeFunctionData.js";

export const encodingActions: Action[] = [
  encodeParamsAction,
  decodeParamsAction,
  functionSelectorAction,
  eventTopicAction,
  encodeFunctionDataAction,
  decodeFunctionDataAction,
];

export {
  encodeParamsAction,
  decodeParamsAction,
  functionSelectorAction,
  eventTopicAction,
  encodeFunctionDataAction,
  decodeFunctionDataAction,
};
