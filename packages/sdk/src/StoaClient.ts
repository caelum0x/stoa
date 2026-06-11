import {
  StoaAgent,
  actionsByName,
  agentIdentityAction,
  agentEscrowAction,
  reputationAction,
  serviceListingAction,
  treasuryGuardAction,
  x402PayAction,
  type Action,
  type DeploymentManifest,
} from "@stoa/skills";

/// A clean, high-level client for Stoa's agent-commerce operations on Pharos.
///
/// `StoaClient` wraps a `StoaAgent` and the verified Stoa skills behind ergonomic methods that
/// return data directly (throwing on error) instead of the `{status, data, message}` envelope.
/// Use it when you want a typed client; use the skills directly when you want LLM tool-calling.
export class StoaClient {
  constructor(public readonly agent: StoaAgent) {}

  static fromEnv(env?: NodeJS.ProcessEnv): StoaClient {
    return new StoaClient(StoaAgent.fromEnv(env));
  }

  static fromManifest(manifest: DeploymentManifest, opts: { privateKey: `0x${string}`; rpcUrl?: string }): StoaClient {
    return new StoaClient(StoaAgent.fromManifest(manifest, opts));
  }

  get address(): `0x${string}` {
    return this.agent.address;
  }

  /// Run a skill and unwrap its result, throwing a readable error on failure.
  private async run<T = Record<string, unknown>>(action: Action, input: unknown): Promise<T> {
    const result = await action.handler(this.agent, input);
    if (result.status === "error") throw new Error(result.message);
    return (result.data ?? {}) as T;
  }

  // --- Identity ------------------------------------------------------------ //

  registerAgent(metadataURI: string): Promise<{ agentId?: number; txHash: string }> {
    return this.run(agentIdentityAction, { op: "register", metadataURI });
  }

  resolveAgent(agentId: number): Promise<Record<string, unknown>> {
    return this.run(agentIdentityAction, { op: "resolve", agentId });
  }

  // --- Marketplace --------------------------------------------------------- //

  listService(input: {
    capability: string;
    endpoint: string;
    price?: string;
    metadataURI?: string;
    agentId?: number;
  }): Promise<{ serviceId?: number; txHash: string }> {
    return this.run(serviceListingAction, { op: "list", ...input });
  }

  discoverServices(capability: string): Promise<{ serviceIds: number[] }> {
    return this.run(serviceListingAction, { op: "browse", capability });
  }

  // --- Escrow -------------------------------------------------------------- //

  createEscrow(input: {
    payee: `0x${string}`;
    milestones: string[];
    token?: `0x${string}` | "native";
    arbiter?: `0x${string}`;
    deadline?: number;
  }): Promise<{ jobId?: number; txHash: string }> {
    return this.run(agentEscrowAction, { op: "create", token: "native", ...input });
  }

  releaseEscrow(jobId: number, index: number): Promise<{ txHash: string }> {
    return this.run(agentEscrowAction, { op: "release", jobId, index });
  }

  refundEscrow(jobId: number): Promise<{ txHash: string }> {
    return this.run(agentEscrowAction, { op: "refund", jobId });
  }

  getEscrow(jobId: number): Promise<Record<string, unknown>> {
    return this.run(agentEscrowAction, { op: "get", jobId });
  }

  // --- Reputation ---------------------------------------------------------- //

  writeReputation(agentId: number, score: number, uri?: string): Promise<{ txHash: string }> {
    return this.run(reputationAction, { op: "attest", agentId, score, uri });
  }

  getReputation(agentId: number): Promise<Record<string, unknown>> {
    return this.run(reputationAction, { op: "score", agentId });
  }

  // --- Treasury & payments ------------------------------------------------- //

  guardedTransfer(input: {
    to: `0x${string}`;
    amount: string;
    token?: `0x${string}` | "native";
    maxPerTx?: string;
    dailyCap?: string;
    allowlist?: `0x${string}`[];
    dryRun?: boolean;
  }): Promise<Record<string, unknown>> {
    return this.run(treasuryGuardAction, { token: "native", ...input });
  }

  payX402(url: string, maxPrice?: string): Promise<Record<string, unknown>> {
    return this.run(x402PayAction, { url, method: "GET", maxPrice });
  }

  // --- Social -------------------------------------------------------------- //

  tip(to: `0x${string}`, amount: string, memo?: string): Promise<{ txHash: string }> {
    const action = actionsByName.TIP_SEND;
    if (!action) throw new Error("TIP_SEND skill unavailable");
    return this.run(action, { to, amount, memo });
  }

  post(contentURI: string): Promise<{ postId?: number; txHash: string }> {
    const action = actionsByName.SOCIAL_POST;
    if (!action) throw new Error("SOCIAL_POST skill unavailable");
    return this.run(action, { contentURI });
  }
}
