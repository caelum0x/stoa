import type { Action } from "../../types.js";
import { etherToWeiAction } from "./etherToWei.js";
import { weiToEtherAction } from "./weiToEther.js";
import { gweiToWeiAction } from "./gweiToWei.js";
import { weiToGweiAction } from "./weiToGwei.js";
import { convertUnitsAction } from "./convertUnits.js";

export const unitsActions: Action[] = [
  etherToWeiAction,
  weiToEtherAction,
  gweiToWeiAction,
  weiToGweiAction,
  convertUnitsAction,
];

export { etherToWeiAction, weiToEtherAction, gweiToWeiAction, weiToGweiAction, convertUnitsAction };
