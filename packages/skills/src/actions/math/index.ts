import type { Action } from "../../types.js";
import { mathAddAction } from "./add.js";
import { mathSubAction } from "./sub.js";
import { mathMulAction } from "./mul.js";
import { mathDivAction } from "./div.js";
import { mathMinAction } from "./min.js";
import { mathMaxAction } from "./max.js";
import { mathCompareAction } from "./compare.js";
import { mathPercentOfAction } from "./percentOf.js";

export const mathActions: Action[] = [
  mathAddAction,
  mathSubAction,
  mathMulAction,
  mathDivAction,
  mathMinAction,
  mathMaxAction,
  mathCompareAction,
  mathPercentOfAction,
];

export {
  mathAddAction,
  mathSubAction,
  mathMulAction,
  mathDivAction,
  mathMinAction,
  mathMaxAction,
  mathCompareAction,
  mathPercentOfAction,
};
