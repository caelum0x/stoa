import type { Action } from "../../types.js";
import { erc165SupportsInterfaceAction } from "./supportsInterface.js";
import { erc165IsErc721Action } from "./isErc721.js";
import { erc165IsErc1155Action } from "./isErc1155.js";

export const erc165Actions: Action[] = [
  erc165SupportsInterfaceAction,
  erc165IsErc721Action,
  erc165IsErc1155Action,
];

export {
  erc165SupportsInterfaceAction,
  erc165IsErc721Action,
  erc165IsErc1155Action,
};
