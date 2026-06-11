import { z } from "zod";
import { parseEventLogs, formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../types.js";
import { serviceRegistryAbi } from "../abi/serviceRegistry.js";
import { addressSchema } from "../schemas.js";

export const serviceListingSchema = z.object({
  op: z
    .enum(["list", "update", "get", "browse", "byProvider"])
    .describe("Marketplace operation."),
  // list
  agentId: z.coerce.number().int().nonnegative().optional().describe("Linked StoaRegistry agent id."),
  capability: z.string().optional().describe("Capability tag, e.g. \"market-insight\"."),
  endpoint: z.string().url().optional().describe("x402-protected service URL (list)."),
  metadataURI: z.string().optional().describe("Schema/docs URI (list)."),
  price: z.string().optional().describe("Headline price in PHRS, human units (list/update)."),
  // update
  serviceId: z.coerce.number().int().positive().optional().describe("Service id (update/get)."),
  active: z.boolean().optional().describe("Active flag (update)."),
  // byProvider
  provider: addressSchema.optional().describe("Provider address (byProvider)."),
});

/// SKILL: service_listing
/// Publishes and discovers agent services in the on-chain ServiceRegistry — the "discover" layer
/// of the agent economy. Browse by capability, list your own service, or read a listing.
export const serviceListingAction: Action<typeof serviceListingSchema> = {
  name: "SERVICE_LISTING",
  similes: ["list service", "browse services", "agent marketplace", "find agent", "publish service"],
  description:
    "List, update, and discover agent services on Pharos via the ServiceRegistry. Services carry a " +
    "capability tag, an x402 endpoint, and a headline price so other agents can find and hire them.",
  examples: [
    {
      input: { op: "list", capability: "market-insight", endpoint: "https://a/insight", price: "0.01" },
      output: ok("Service listed", { serviceId: 4 }),
      explanation: "Publishes a discoverable, priced service.",
    },
    {
      input: { op: "browse", capability: "market-insight" },
      output: ok("Found services", { serviceIds: [4, 9] }),
      explanation: "Finds all services offering a capability.",
    },
  ],
  schema: serviceListingSchema,
  handler: async (agent, input) => {
    try {
      const registry = agent.requireContract("services");
      const { parseEther } = await import("viem");

      if (input.op === "list") {
        if (!input.capability || !input.endpoint) {
          return fail("capability and endpoint are required to list.");
        }
        const priceWei = input.price ? parseEther(input.price) : 0n;
        const hash = await agent.walletClient.writeContract({
          address: registry,
          abi: serviceRegistryAbi,
          functionName: "list",
          args: [
            BigInt(input.agentId ?? 0),
            input.capability,
            input.endpoint,
            input.metadataURI ?? "",
            priceWei,
          ],
        });
        const receipt = await agent.publicClient.waitForTransactionReceipt({ hash });
        const events = parseEventLogs({
          abi: serviceRegistryAbi,
          logs: receipt.logs,
          eventName: "ServiceListed",
        });
        const serviceId = events[0]?.args.serviceId;
        return ok("Service listed", {
          serviceId: serviceId !== undefined ? Number(serviceId) : undefined,
          txHash: hash,
        });
      }

      if (input.op === "update") {
        if (input.serviceId === undefined) return fail("serviceId is required to update.");
        const { parseEther: pe } = await import("viem");
        const hash = await agent.walletClient.writeContract({
          address: registry,
          abi: serviceRegistryAbi,
          functionName: "update",
          args: [BigInt(input.serviceId), input.price ? pe(input.price) : 0n, input.active ?? true],
        });
        await agent.publicClient.waitForTransactionReceipt({ hash });
        return ok("Service updated", { serviceId: input.serviceId, txHash: hash });
      }

      if (input.op === "get") {
        if (input.serviceId === undefined) return fail("serviceId is required to get.");
        const s = await agent.publicClient.readContract({
          address: registry,
          abi: serviceRegistryAbi,
          functionName: "getService",
          args: [BigInt(input.serviceId)],
        });
        return ok("Service read", {
          serviceId: input.serviceId,
          provider: s.provider,
          agentId: Number(s.agentId),
          capability: s.capability,
          endpoint: s.endpoint,
          metadataURI: s.metadataURI,
          price: formatEther(s.priceWei),
          active: s.active,
        });
      }

      if (input.op === "browse") {
        if (!input.capability) return fail("capability is required to browse.");
        const ids = await agent.publicClient.readContract({
          address: registry,
          abi: serviceRegistryAbi,
          functionName: "servicesByCapability",
          args: [input.capability],
        });
        return ok("Found services", { capability: input.capability, serviceIds: ids.map(Number) });
      }

      // byProvider
      if (!input.provider) return fail("provider is required for byProvider.");
      const ids = await agent.publicClient.readContract({
        address: registry,
        abi: serviceRegistryAbi,
        functionName: "servicesByProvider",
        args: [input.provider],
      });
      return ok("Provider services", { provider: input.provider, serviceIds: ids.map(Number) });
    } catch (e) {
      return fail(`service_listing failed: ${errorMessage(e)}`);
    }
  },
};
