/// A commerce scenario the buyer agent wants fulfilled: a capability to source,
/// a price ceiling (in PHRS), and the escrow milestone schedule to release on delivery.
export interface CommerceScenario {
  capability: string;
  maxPricePhrs: string;
  milestones: string[];
}

/// The default scenario used by the demo runners: buy a small research deliverable
/// for at most 0.05 PHRS, funded as a single 0.001 PHRS milestone.
export const defaultScenario: CommerceScenario = {
  capability: "research",
  maxPricePhrs: "0.05",
  milestones: ["0.001"],
};
