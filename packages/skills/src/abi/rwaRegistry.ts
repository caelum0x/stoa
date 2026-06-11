/// Typed ABI for RwaRegistry (kept in sync with the contract).
export const rwaRegistryAbi = [
  { type: "function", name: "issue", stateMutability: "nonpayable", inputs: [{ name: "holder", type: "address" }, { name: "assetType", type: "string" }, { name: "valuation", type: "uint256" }, { name: "metadataURI", type: "string" }], outputs: [{ name: "assetId", type: "uint256" }] },
  { type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [{ name: "assetId", type: "uint256" }, { name: "to", type: "address" }], outputs: [] },
  { type: "function", name: "redeem", stateMutability: "nonpayable", inputs: [{ name: "assetId", type: "uint256" }], outputs: [] },
  {
    type: "function",
    name: "getAsset",
    stateMutability: "view",
    inputs: [{ name: "assetId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "issuer", type: "address" },
          { name: "holder", type: "address" },
          { name: "assetType", type: "string" },
          { name: "valuation", type: "uint256" },
          { name: "metadataURI", type: "string" },
          { name: "redeemed", type: "bool" },
        ],
      },
    ],
  },
  { type: "function", name: "assetsByHolder", stateMutability: "view", inputs: [{ name: "holder", type: "address" }], outputs: [{ name: "", type: "uint256[]" }] },
  { type: "event", name: "Issued", inputs: [{ name: "assetId", type: "uint256", indexed: true }, { name: "issuer", type: "address", indexed: true }, { name: "holder", type: "address", indexed: true }, { name: "valuation", type: "uint256", indexed: false }] },
] as const;
