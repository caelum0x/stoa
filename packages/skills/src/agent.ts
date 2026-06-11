import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type Chain,
  type PublicClient,
  type WalletClient,
  type Transport,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { DEFAULT_CHAIN, KNOWN_CHAINS } from "./chains.js";

export interface StoaAgentOptions {
  /// Hex private key for the agent's signer (testnet only).
  privateKey: `0x${string}`;
  /// Override RPC URL. Defaults to the chain's public RPC.
  rpcUrl?: string;
  /// Chain id. Defaults to Pharos Atlantic (688689).
  chainId?: number;
  /// Full viem Chain override (e.g. a local anvil chain). Takes precedence over chainId.
  chain?: Chain;
  /// Deployed contract addresses, surfaced to skills that need them.
  contracts?: StoaContracts;
}

export interface StoaContracts {
  registry?: `0x${string}`;
  escrow?: `0x${string}`;
  services?: `0x${string}`;
  social?: `0x${string}`;
  tipJar?: `0x${string}`;
  streaming?: `0x${string}`;
  faucet?: `0x${string}`;
}

/// The execution context handed to every Stoa skill handler.
///
/// Structurally compatible with the Pharos Agent Kit `PharosAgentKit` instance
/// (it exposes the same viem `account`, `publicClient`, and `walletClient`), so a
/// kit instance can be passed wherever a `StoaAgent` is expected and vice-versa.
export class StoaAgent {
  readonly account: Account;
  readonly chain: Chain;
  readonly rpcUrl: string;
  readonly publicClient: PublicClient<Transport, Chain>;
  readonly walletClient: WalletClient<Transport, Chain, Account>;
  readonly contracts: StoaContracts;

  constructor(options: StoaAgentOptions) {
    const chain = options.chain ?? KNOWN_CHAINS[options.chainId ?? DEFAULT_CHAIN.id] ?? DEFAULT_CHAIN;
    const rpcUrl = options.rpcUrl ?? chain.rpcUrls.default.http[0];
    if (!rpcUrl) throw new Error(`No RPC URL configured for chain ${chain.id}`);

    const transport = http(rpcUrl);
    this.account = privateKeyToAccount(options.privateKey);
    this.chain = chain;
    this.rpcUrl = rpcUrl;
    this.publicClient = createPublicClient({ chain, transport });
    this.walletClient = createWalletClient({ account: this.account, chain, transport });
    this.contracts = options.contracts ?? {};
  }

  get address(): `0x${string}` {
    return this.account.address;
  }

  /// Build an agent from environment variables. Used by the MCP server and examples.
  ///   STOA_PRIVATE_KEY     (required)
  ///   PHAROS_RPC_URL       (optional)
  ///   STOA_CHAIN_ID        (optional)
  ///   STOA_REGISTRY_ADDRESS / STOA_ESCROW_ADDRESS (optional)
  static fromEnv(env: NodeJS.ProcessEnv = process.env): StoaAgent {
    const privateKey = env.STOA_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("STOA_PRIVATE_KEY is not set. Add it to your environment or .env file.");
    }
    return new StoaAgent({
      privateKey: privateKey as `0x${string}`,
      rpcUrl: env.PHAROS_RPC_URL,
      chainId: env.STOA_CHAIN_ID ? Number(env.STOA_CHAIN_ID) : undefined,
      contracts: {
        registry: env.STOA_REGISTRY_ADDRESS as `0x${string}` | undefined,
        escrow: env.STOA_ESCROW_ADDRESS as `0x${string}` | undefined,
        services: env.STOA_SERVICES_ADDRESS as `0x${string}` | undefined,
        social: env.STOA_SOCIAL_ADDRESS as `0x${string}` | undefined,
        tipJar: env.STOA_TIPJAR_ADDRESS as `0x${string}` | undefined,
        streaming: env.STOA_STREAMING_ADDRESS as `0x${string}` | undefined,
        faucet: env.STOA_FAUCET_ADDRESS as `0x${string}` | undefined,
      },
    });
  }

  /// Resolve a required contract address or throw a helpful error.
  requireContract(name: keyof StoaContracts): `0x${string}` {
    const addr = this.contracts[name];
    if (!addr) {
      throw new Error(
        `Stoa ${name} contract address is not configured. Set STOA_${name.toUpperCase()}_ADDRESS ` +
          "after deploying with `pnpm contracts:deploy`.",
      );
    }
    return addr;
  }
}
