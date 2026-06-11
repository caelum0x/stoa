import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { stoaRegistryAbi } from "../../abi/stoaRegistry.js";

export const agentDiscoverySchema = z.object({
  fromBlock: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Block height to scan AgentRegistered events from. Defaults to genesis."),
});

/// SKILL: agent_discovery — discover registered agents via StoaRegistry events.
export const agentDiscoveryAction: Action<typeof agentDiscoverySchema> = {
  name: "AGENT_DISCOVERY",
  similes: ["discover agents", "list agents", "find registered agents", "agent registry events"],
  description: "Discover agents registered on StoaRegistry by scanning AgentRegistered events on Pharos.",
  examples: [
    {
      input: { fromBlock: 0 },
      output: ok("Agents discovered", {
        count: 1,
        agents: [{ agentId: "1", owner: "0xabc", metadataURI: "ipfs://meta" }],
      }),
      explanation: "Scans AgentRegistered events from genesis.",
    },
  ],
  schema: agentDiscoverySchema,
  handler: async (agent, input) => {
    try {
      const fromBlock = input.fromBlock === undefined ? undefined : BigInt(input.fromBlock);
      const events = await agent.publicClient.getContractEvents({
        address: agent.requireContract("registry"),
        abi: stoaRegistryAbi,
        eventName: "AgentRegistered",
        fromBlock,
      });
      const agents = events.slice(0, 100).map((e) => {
        const args = e.args as { agentId?: bigint; owner?: string; metadataURI?: string };
        return {
          agentId: (args.agentId ?? 0n).toString(),
          owner: args.owner ?? "0x",
          metadataURI: args.metadataURI ?? "",
        };
      });
      return ok("Agents discovered", { count: agents.length, agents });
    } catch (e) {
      return fail(`agent_discovery failed: ${errorMessage(e)}`);
    }
  },
};
