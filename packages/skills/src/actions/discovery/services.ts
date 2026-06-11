import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { serviceRegistryAbi } from "../../abi/serviceRegistry.js";

export const serviceDiscoverySchema = z.object({
  fromBlock: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Block height to scan ServiceListed events from. Defaults to genesis."),
});

/// SKILL: service_discovery — discover listed services via ServiceRegistry events.
export const serviceDiscoveryAction: Action<typeof serviceDiscoverySchema> = {
  name: "SERVICE_DISCOVERY",
  similes: ["discover services", "list services", "find services", "service registry events"],
  description: "Discover services listed on ServiceRegistry by scanning ServiceListed events on Pharos.",
  examples: [
    {
      input: { fromBlock: 0 },
      output: ok("Services discovered", {
        count: 1,
        services: [{ serviceId: "1", provider: "0xabc", capability: "inference", priceWei: "1000" }],
      }),
      explanation: "Scans ServiceListed events from genesis.",
    },
  ],
  schema: serviceDiscoverySchema,
  handler: async (agent, input) => {
    try {
      const fromBlock = input.fromBlock === undefined ? undefined : BigInt(input.fromBlock);
      const events = await agent.publicClient.getContractEvents({
        address: agent.requireContract("services"),
        abi: serviceRegistryAbi,
        eventName: "ServiceListed",
        fromBlock,
      });
      const services = events.slice(0, 100).map((e) => {
        const args = e.args as {
          serviceId?: bigint;
          provider?: string;
          capability?: string;
          priceWei?: bigint;
        };
        return {
          serviceId: (args.serviceId ?? 0n).toString(),
          provider: args.provider ?? "0x",
          capability: args.capability ?? "",
          priceWei: (args.priceWei ?? 0n).toString(),
        };
      });
      return ok("Services discovered", { count: services.length, services });
    } catch (e) {
      return fail(`service_discovery failed: ${errorMessage(e)}`);
    }
  },
};
