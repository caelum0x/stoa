import type { Action } from "../../types.js";
import { contractReadAction } from "./read.js";
import { contractWriteAction } from "./write.js";
import { contractSimulateAction } from "./simulate.js";
import { getStorageAtAction } from "./getStorageAt.js";
import { contractMulticallAction } from "./multicall.js";

export const contractActions: Action[] = [
  contractReadAction,
  contractWriteAction,
  contractSimulateAction,
  getStorageAtAction,
  contractMulticallAction,
];

export {
  contractReadAction,
  contractWriteAction,
  contractSimulateAction,
  getStorageAtAction,
  contractMulticallAction,
};
