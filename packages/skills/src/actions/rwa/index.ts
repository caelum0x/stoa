import type { Action } from "../../types.js";
import { rwaIssueAction } from "./issue.js";
import { rwaTransferAction } from "./transfer.js";
import { rwaRedeemAction } from "./redeem.js";
import { rwaGetAction } from "./get.js";

export const rwaActions: Action[] = [rwaIssueAction, rwaTransferAction, rwaRedeemAction, rwaGetAction];

export { rwaIssueAction, rwaTransferAction, rwaRedeemAction, rwaGetAction };
