/// Typed ABI for AgentVault (kept in sync with the contract).
export const agentVaultAbi = [
  { type: "function", name: "submit", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }, { name: "data", type: "bytes" }], outputs: [{ name: "txId", type: "uint256" }] },
  { type: "function", name: "confirm", stateMutability: "nonpayable", inputs: [{ name: "txId", type: "uint256" }], outputs: [] },
  { type: "function", name: "revokeConfirmation", stateMutability: "nonpayable", inputs: [{ name: "txId", type: "uint256" }], outputs: [] },
  { type: "function", name: "execute", stateMutability: "nonpayable", inputs: [{ name: "txId", type: "uint256" }], outputs: [] },
  { type: "function", name: "threshold", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "ownerCount", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "txCount", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "isOwner", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "bool" }] },
  {
    type: "function",
    name: "getTransaction",
    stateMutability: "view",
    inputs: [{ name: "txId", type: "uint256" }],
    outputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "executed", type: "bool" },
      { name: "confirmations", type: "uint256" },
    ],
  },
  { type: "event", name: "Submitted", inputs: [{ name: "txId", type: "uint256", indexed: true }, { name: "to", type: "address", indexed: true }, { name: "value", type: "uint256", indexed: false }] },
] as const;
