/// Typed ABI for StoaEscrow (kept in sync with packages/contracts/src/StoaEscrow.sol).
export const stoaEscrowAbi = [
  {
    type: "function",
    name: "createJob",
    stateMutability: "payable",
    inputs: [
      { name: "payee", type: "address" },
      { name: "arbiter", type: "address" },
      { name: "token", type: "address" },
      { name: "deadline", type: "uint64" },
      { name: "milestoneAmounts", type: "uint256[]" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
  },
  {
    type: "function",
    name: "release",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "index", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "refund",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getJob",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        name: "job",
        type: "tuple",
        components: [
          { name: "payer", type: "address" },
          { name: "payee", type: "address" },
          { name: "arbiter", type: "address" },
          { name: "token", type: "address" },
          { name: "deadline", type: "uint64" },
          { name: "state", type: "uint8" },
          { name: "total", type: "uint256" },
          { name: "released", type: "uint256" },
        ],
      },
      { name: "milestones", type: "uint256[]" },
      { name: "released", type: "bool[]" },
    ],
  },
  {
    type: "event",
    name: "JobCreated",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "payee", type: "address", indexed: true },
      { name: "token", type: "address", indexed: false },
      { name: "total", type: "uint256", indexed: false },
    ],
  },
] as const;

export const ESCROW_STATE = ["Active", "Completed", "Refunded"] as const;
