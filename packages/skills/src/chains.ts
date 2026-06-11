import { defineChain, type Chain } from "viem";

/// Pharos Atlantic Testnet — chain id 688689.
export const pharosAtlantic = defineChain({
  id: 688689,
  name: "Pharos Atlantic Testnet",
  nativeCurrency: { name: "PHRS", symbol: "PHRS", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://atlantic.dplabs-internal.com/"] },
  },
  blockExplorers: {
    default: { name: "Pharos Explorer", url: "https://atlantic.pharosscan.xyz" },
  },
  testnet: true,
});

/// Pharos Testnet — chain id 688688 (the primary public testnet).
export const pharosTestnet = defineChain({
  id: 688688,
  name: "Pharos Testnet",
  nativeCurrency: { name: "PHRS", symbol: "PHRS", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.dplabs-internal.com/"] },
  },
  testnet: true,
});

export const DEFAULT_CHAIN = pharosAtlantic;

export const KNOWN_CHAINS: Record<number, Chain> = {
  [pharosAtlantic.id]: pharosAtlantic,
  [pharosTestnet.id]: pharosTestnet,
};

/// Well-known test USDC on Pharos Atlantic (used by x402 demos).
export const TEST_USDC = "0xE0BE08c77f415F577A1B3A9aD7a1Df1479564ec8" as const;

/// CAIP-2 style network id used by the x402 stack (e.g. "eip155:688689").
export const x402Network = (chainId: number): `eip155:${number}` => `eip155:${chainId}`;
