import type { Action } from "../../types.js";
import { rawRpcRequestAction } from "./request.js";
import { rpcHealthAction } from "./health.js";

export const rpcActions: Action[] = [rawRpcRequestAction, rpcHealthAction];

export { rawRpcRequestAction, rpcHealthAction };
