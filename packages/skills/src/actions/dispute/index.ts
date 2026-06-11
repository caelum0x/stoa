import type { Action } from "../../types.js";
import { disputeOpenAction } from "./open.js";
import { disputeVoteAction } from "./vote.js";
import { disputeGetAction } from "./get.js";

export const disputeActions: Action[] = [disputeOpenAction, disputeVoteAction, disputeGetAction];

export { disputeOpenAction, disputeVoteAction, disputeGetAction };
