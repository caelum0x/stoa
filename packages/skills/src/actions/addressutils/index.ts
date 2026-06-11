import type { Action } from "../../types.js";
import { isZeroAddressAction } from "./isZeroAddress.js";
import { addressEqualAction } from "./addressEqual.js";
import { contractAddressAction } from "./contractAddress.js";
import { create2AddressAction } from "./create2Address.js";

export const addressutilsActions: Action[] = [
  isZeroAddressAction,
  addressEqualAction,
  contractAddressAction,
  create2AddressAction,
];

export { isZeroAddressAction, addressEqualAction, contractAddressAction, create2AddressAction };
