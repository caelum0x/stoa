/// Typed ABI for Faucet (kept in sync with packages/contracts/src/Faucet.sol).
export const faucetAbi = [
  { type: "function", name: "drip", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "fund", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "dripAmount", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "cooldown", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "lastDrip", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "nextDripAt", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;
