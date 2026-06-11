/// Typed ABI for SubscriptionManager (kept in sync with the contract).
export const subscriptionManagerAbi = [
  { type: "function", name: "createPlan", stateMutability: "nonpayable", inputs: [{ name: "price", type: "uint256" }, { name: "period", type: "uint64" }], outputs: [{ name: "planId", type: "uint256" }] },
  { type: "function", name: "subscribe", stateMutability: "payable", inputs: [{ name: "planId", type: "uint256" }], outputs: [{ name: "subId", type: "uint256" }] },
  { type: "function", name: "charge", stateMutability: "nonpayable", inputs: [{ name: "subId", type: "uint256" }], outputs: [] },
  { type: "function", name: "topUp", stateMutability: "payable", inputs: [{ name: "subId", type: "uint256" }], outputs: [] },
  { type: "function", name: "cancel", stateMutability: "nonpayable", inputs: [{ name: "subId", type: "uint256" }], outputs: [] },
  { type: "function", name: "plans", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ name: "provider", type: "address" }, { name: "price", type: "uint256" }, { name: "period", type: "uint64" }, { name: "active", type: "bool" }] },
  { type: "function", name: "subs", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ name: "planId", type: "uint256" }, { name: "subscriber", type: "address" }, { name: "balance", type: "uint256" }, { name: "nextCharge", type: "uint64" }, { name: "active", type: "bool" }] },
  { type: "event", name: "PlanCreated", inputs: [{ name: "planId", type: "uint256", indexed: true }, { name: "provider", type: "address", indexed: true }, { name: "price", type: "uint256", indexed: false }, { name: "period", type: "uint64", indexed: false }] },
  { type: "event", name: "Subscribed", inputs: [{ name: "subId", type: "uint256", indexed: true }, { name: "planId", type: "uint256", indexed: true }, { name: "subscriber", type: "address", indexed: true }, { name: "funded", type: "uint256", indexed: false }] },
] as const;
