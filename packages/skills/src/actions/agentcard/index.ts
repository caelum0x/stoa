import type { Action } from "../../types.js";
import { buildAgentCardAction } from "./build.js";
import { parseAgentCardAction } from "./parse.js";

export const agentcardActions: Action[] = [buildAgentCardAction, parseAgentCardAction];

export { buildAgentCardAction, parseAgentCardAction };
