import type { Action } from "../../types.js";
import { subscriptionCreatePlanAction } from "./createPlan.js";
import { subscriptionSubscribeAction } from "./subscribe.js";
import { subscriptionChargeAction } from "./charge.js";
import { subscriptionTopUpAction } from "./topUp.js";
import { subscriptionCancelAction } from "./cancel.js";
import { subscriptionGetAction } from "./get.js";

export const subscriptionActions: Action[] = [
  subscriptionCreatePlanAction,
  subscriptionSubscribeAction,
  subscriptionChargeAction,
  subscriptionTopUpAction,
  subscriptionCancelAction,
  subscriptionGetAction,
];

export {
  subscriptionCreatePlanAction,
  subscriptionSubscribeAction,
  subscriptionChargeAction,
  subscriptionTopUpAction,
  subscriptionCancelAction,
  subscriptionGetAction,
};
