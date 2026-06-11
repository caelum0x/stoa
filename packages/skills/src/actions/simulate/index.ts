import type { Action } from "../../types.js";
import { rawCallAction } from "./rawCall.js";
import { estimateContractGasAction } from "./estimateContractGas.js";
import { prepareTxAction } from "./prepareTx.js";

export const simulateActions: Action[] = [
  rawCallAction,
  estimateContractGasAction,
  prepareTxAction,
];

export { rawCallAction, estimateContractGasAction, prepareTxAction };
