/// Typed ABI for SessionKeyManager (kept in sync with the contract).
export const sessionKeyManagerAbi = [
  { type: "function", name: "deposit", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "authorize", stateMutability: "nonpayable", inputs: [{ name: "sessionKey", type: "address" }, { name: "cap", type: "uint256" }, { name: "validUntil", type: "uint64" }], outputs: [] },
  { type: "function", name: "revoke", stateMutability: "nonpayable", inputs: [{ name: "sessionKey", type: "address" }], outputs: [] },
  { type: "function", name: "spend", stateMutability: "nonpayable", inputs: [{ name: "owner", type: "address" }, { name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "allowanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "sessionKey", type: "address" }], outputs: [{ name: "cap", type: "uint256" }, { name: "validUntil", type: "uint64" }, { name: "active", type: "bool" }] },
] as const;
