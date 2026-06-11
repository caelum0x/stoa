import type { Action } from "../../types.js";
import { agentAddressAction } from "./address.js";
import { signMessageAction } from "./signMessage.js";
import { verifyMessageAction } from "./verifyMessage.js";

export const walletActions: Action[] = [agentAddressAction, signMessageAction, verifyMessageAction];

export { agentAddressAction, signMessageAction, verifyMessageAction };
