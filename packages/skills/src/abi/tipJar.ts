/// Typed ABI for TipJar (kept in sync with packages/contracts/src/TipJar.sol).
export const tipJarAbi = [
  { type: "function", name: "tip", stateMutability: "payable", inputs: [{ name: "to", type: "address" }, { name: "memo", type: "string" }], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "balance", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "totalReceived", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "totalGiven", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "tipsBetween", stateMutability: "view", inputs: [{ name: "", type: "address" }, { name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  {
    type: "event",
    name: "Tipped",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "memo", type: "string", indexed: false },
    ],
  },
] as const;
