import type { Action } from "../../types.js";
import { agentDiscoveryAction } from "./agents.js";
import { serviceDiscoveryAction } from "./services.js";

export const discoveryActions: Action[] = [agentDiscoveryAction, serviceDiscoveryAction];

export { agentDiscoveryAction, serviceDiscoveryAction };
