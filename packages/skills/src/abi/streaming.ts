/// Typed ABI for Streaming (kept in sync with packages/contracts/src/Streaming.sol).
export const streamingAbi = [
  { type: "function", name: "createStream", stateMutability: "payable", inputs: [{ name: "recipient", type: "address" }, { name: "start", type: "uint64" }, { name: "stop", type: "uint64" }], outputs: [{ name: "streamId", type: "uint256" }] },
  { type: "function", name: "createStreamErc20", stateMutability: "nonpayable", inputs: [{ name: "recipient", type: "address" }, { name: "token", type: "address" }, { name: "amount", type: "uint256" }, { name: "start", type: "uint64" }, { name: "stop", type: "uint64" }], outputs: [{ name: "streamId", type: "uint256" }] },
  { type: "function", name: "streamedAmount", stateMutability: "view", inputs: [{ name: "streamId", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "withdrawable", stateMutability: "view", inputs: [{ name: "streamId", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ name: "streamId", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "cancel", stateMutability: "nonpayable", inputs: [{ name: "streamId", type: "uint256" }], outputs: [] },
  {
    type: "function",
    name: "getStream",
    stateMutability: "view",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "sender", type: "address" },
          { name: "recipient", type: "address" },
          { name: "token", type: "address" },
          { name: "deposit", type: "uint256" },
          { name: "withdrawn", type: "uint256" },
          { name: "start", type: "uint64" },
          { name: "stop", type: "uint64" },
          { name: "cancelled", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "StreamCreated",
    inputs: [
      { name: "streamId", type: "uint256", indexed: true },
      { name: "sender", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "deposit", type: "uint256", indexed: false },
    ],
  },
] as const;
