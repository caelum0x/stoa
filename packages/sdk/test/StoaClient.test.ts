import { describe, it, expect } from "vitest";
import { StoaClient, StoaAgent } from "../src/index.js";

// Anvil/Hardhat dev key #1 — never used with real funds.
const TEST_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" as const;

describe("StoaClient", () => {
  const client = new StoaClient(new StoaAgent({ privateKey: TEST_KEY }));

  it("exposes the agent address", () => {
    expect(client.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("exposes the full commerce method surface", () => {
    const methods = [
      "registerAgent",
      "resolveAgent",
      "listService",
      "discoverServices",
      "createEscrow",
      "releaseEscrow",
      "refundEscrow",
      "getEscrow",
      "writeReputation",
      "getReputation",
      "guardedTransfer",
      "payX402",
      "tip",
      "post",
    ] as const;
    for (const m of methods) {
      expect(typeof (client as unknown as Record<string, unknown>)[m]).toBe("function");
    }
  });

  it("throws a helpful error when a required contract is unconfigured", async () => {
    await expect(client.resolveAgent(1)).rejects.toThrow(/registry/i);
  });

  it("builds from a deployment manifest (placeholders dropped)", () => {
    const c = StoaClient.fromManifest(
      {
        network: "test",
        chainId: 688689,
        contracts: { registry: "0x1111111111111111111111111111111111111111", escrow: "0x..." },
      },
      { privateKey: TEST_KEY },
    );
    expect(c.agent.contracts.registry).toBe("0x1111111111111111111111111111111111111111");
    expect(c.agent.contracts.escrow).toBeUndefined(); // placeholder dropped
  });
});
