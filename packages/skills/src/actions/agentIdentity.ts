import { z } from "zod";
import { parseEventLogs } from "viem";
import { type Action, ok, fail, errorMessage } from "../types.js";
import { stoaRegistryAbi } from "../abi/stoaRegistry.js";
import { agentIdSchema } from "../schemas.js";

export const agentIdentitySchema = z.object({
  op: z
    .enum(["register", "resolve", "update"])
    .describe("register a new identity, resolve an existing one, or update metadata."),
  metadataURI: z
    .string()
    .optional()
    .describe("Agent card URI (ipfs://, https://, data:). Required for register/update."),
  agentId: agentIdSchema.optional().describe("Target agent id. Required for resolve/update."),
});

/// SKILL: agent_identity
/// Registers and resolves agent identities in the on-chain StoaRegistry (ERC-8004-lite).
export const agentIdentityAction: Action<typeof agentIdentitySchema> = {
  name: "AGENT_IDENTITY",
  similes: ["register agent", "agent id", "resolve agent", "agent identity", "agent card"],
  description:
    "Register, resolve, or update an agent identity in the StoaRegistry on Pharos. Identities " +
    "carry an off-chain metadata URI (agent card) and accrue on-chain reputation.",
  examples: [
    {
      input: { op: "register", metadataURI: "ipfs://bafy.../agent.json" },
      output: ok("Agent registered", { agentId: 7, txHash: "0x..." }),
      explanation: "Mints a new on-chain identity for the agent.",
    },
    {
      input: { op: "resolve", agentId: 7 },
      output: ok("Resolved agent", { owner: "0x...", metadataURI: "ipfs://...", reputation: {} }),
      explanation: "Reads an agent's identity and reputation.",
    },
  ],
  schema: agentIdentitySchema,
  handler: async (agent, input) => {
    try {
      const registry = agent.requireContract("registry");

      if (input.op === "register") {
        if (!input.metadataURI) return fail("metadataURI is required to register.");
        const hash = await agent.walletClient.writeContract({
          address: registry,
          abi: stoaRegistryAbi,
          functionName: "register",
          args: [input.metadataURI],
        });
        const receipt = await agent.publicClient.waitForTransactionReceipt({ hash });
        const events = parseEventLogs({
          abi: stoaRegistryAbi,
          logs: receipt.logs,
          eventName: "AgentRegistered",
        });
        const agentId = events[0]?.args.agentId;
        return ok("Agent registered", {
          agentId: agentId !== undefined ? Number(agentId) : undefined,
          txHash: hash,
          owner: agent.address,
        });
      }

      if (input.op === "update") {
        if (!input.agentId || !input.metadataURI) {
          return fail("agentId and metadataURI are required to update.");
        }
        const hash = await agent.walletClient.writeContract({
          address: registry,
          abi: stoaRegistryAbi,
          functionName: "updateMetadata",
          args: [BigInt(input.agentId), input.metadataURI],
        });
        await agent.publicClient.waitForTransactionReceipt({ hash });
        return ok("Metadata updated", { agentId: input.agentId, txHash: hash });
      }

      // resolve
      if (!input.agentId) return fail("agentId is required to resolve.");
      const [owner, metadataURI, createdAt] = await agent.publicClient.readContract({
        address: registry,
        abi: stoaRegistryAbi,
        functionName: "getAgent",
        args: [BigInt(input.agentId)],
      });
      const [count, scoreSum] = await agent.publicClient.readContract({
        address: registry,
        abi: stoaRegistryAbi,
        functionName: "reputationOf",
        args: [BigInt(input.agentId)],
      });
      return ok("Resolved agent", {
        agentId: input.agentId,
        owner,
        metadataURI,
        createdAt: Number(createdAt),
        reputation: { count: Number(count), scoreSum: Number(scoreSum) },
      });
    } catch (e) {
      return fail(`agent_identity failed: ${errorMessage(e)}`);
    }
  },
};
