/// Typed ABI for ArbiterPanel (kept in sync with the contract).
export const arbiterPanelAbi = [
  { type: "function", name: "openCase", stateMutability: "nonpayable", inputs: [{ name: "jobRef", type: "uint256" }, { name: "evidenceURI", type: "string" }], outputs: [{ name: "caseId", type: "uint256" }] },
  { type: "function", name: "vote", stateMutability: "nonpayable", inputs: [{ name: "caseId", type: "uint256" }, { name: "favorPayee", type: "bool" }], outputs: [] },
  { type: "function", name: "threshold", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
  { type: "function", name: "caseCount", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "isArbiter", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "bool" }] },
  {
    type: "function",
    name: "getCase",
    stateMutability: "view",
    inputs: [{ name: "caseId", type: "uint256" }],
    outputs: [
      { name: "jobRef", type: "uint256" },
      { name: "opener", type: "address" },
      { name: "evidenceURI", type: "string" },
      { name: "votesPayee", type: "uint8" },
      { name: "votesPayer", type: "uint8" },
      { name: "verdict", type: "uint8" },
    ],
  },
  { type: "event", name: "CaseOpened", inputs: [{ name: "caseId", type: "uint256", indexed: true }, { name: "jobRef", type: "uint256", indexed: true }, { name: "opener", type: "address", indexed: true }, { name: "evidenceURI", type: "string", indexed: false }] },
] as const;

export const VERDICT = ["Pending", "FavorPayee", "FavorPayer"] as const;
