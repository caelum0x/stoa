/// SKILL: known_tokens — static registry of well-known tokens on Pharos.

/// A known token entry. `address` is the ERC-20 contract address, or "native"
/// for the chain's native currency (PHRS).
export interface KnownToken {
  address: string;
  decimals: number;
  name: string;
}

/// Symbol -> token metadata for tokens recognized by Stoa on Pharos.
export const KNOWN_TOKENS: Readonly<Record<string, KnownToken>> = {
  PHRS: { address: "native", decimals: 18, name: "Pharos" },
  USDC: { address: "0xE0BE08c77f415F577A1B3A9aD7a1Df1479564ec8", decimals: 6, name: "USD Coin (test)" },
};
