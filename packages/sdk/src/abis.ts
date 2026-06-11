// @stoa/sdk — re-exported contract ABIs.
//
// Convenience surface so SDK consumers can pass these directly to viem/wagmi
// without depending on @stoa/skills.

export {
  stoaRegistryAbi,
  stoaEscrowAbi,
  erc20Abi,
} from "@stoa/skills";
