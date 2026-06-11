import { StoaAgent } from "@stoa/skills";
import type { StoaContracts } from "@stoa/skills";

/// Build a {@link StoaAgent} from a raw private key plus optional contract addresses.
///
/// A thin convenience wrapper used by the demo runners: it reads the RPC URL and
/// chain id from the environment (falling back to the package defaults) so callers
/// only need to supply a signer key. Contract addresses default to the standard
/// `STOA_*_ADDRESS` environment variables when not passed explicitly.
export function makeAgent(privateKey: string, contracts?: StoaContracts): StoaAgent {
  return new StoaAgent({
    privateKey: privateKey as `0x${string}`,
    rpcUrl: process.env.PHAROS_RPC_URL,
    chainId: process.env.STOA_CHAIN_ID ? Number(process.env.STOA_CHAIN_ID) : undefined,
    contracts: contracts ?? {
      registry: process.env.STOA_REGISTRY_ADDRESS as `0x${string}` | undefined,
      escrow: process.env.STOA_ESCROW_ADDRESS as `0x${string}` | undefined,
    },
  });
}
