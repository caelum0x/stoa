/// Typed ABI for ValueReputation (kept in sync with the contract).
export const valueReputationAbi = [
  { type: "function", name: "recordSettlement", stateMutability: "nonpayable", inputs: [{ name: "agentId", type: "uint256" }, { name: "value", type: "uint256" }], outputs: [] },
  { type: "function", name: "scoreOf", stateMutability: "view", inputs: [{ name: "agentId", type: "uint256" }], outputs: [{ name: "totalValue", type: "uint256" }, { name: "jobCount", type: "uint64" }, { name: "averageValue", type: "uint256" }] },
  { type: "event", name: "Settlement", inputs: [{ name: "agentId", type: "uint256", indexed: true }, { name: "from", type: "address", indexed: true }, { name: "value", type: "uint256", indexed: false }] },
] as const;
