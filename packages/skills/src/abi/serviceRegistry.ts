/// Typed ABI for ServiceRegistry (kept in sync with packages/contracts/src/ServiceRegistry.sol).
export const serviceRegistryAbi = [
  {
    type: "function",
    name: "list",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "capability", type: "string" },
      { name: "endpoint", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "priceWei", type: "uint256" },
    ],
    outputs: [{ name: "serviceId", type: "uint256" }],
  },
  {
    type: "function",
    name: "update",
    stateMutability: "nonpayable",
    inputs: [
      { name: "serviceId", type: "uint256" },
      { name: "priceWei", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getService",
    stateMutability: "view",
    inputs: [{ name: "serviceId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "provider", type: "address" },
          { name: "agentId", type: "uint256" },
          { name: "capability", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "metadataURI", type: "string" },
          { name: "priceWei", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "servicesByProvider",
    stateMutability: "view",
    inputs: [{ name: "provider", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "servicesByCapability",
    stateMutability: "view",
    inputs: [{ name: "capability", type: "string" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "totalServices",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "ServiceListed",
    inputs: [
      { name: "serviceId", type: "uint256", indexed: true },
      { name: "provider", type: "address", indexed: true },
      { name: "capability", type: "string", indexed: false },
      { name: "priceWei", type: "uint256", indexed: false },
    ],
  },
] as const;
