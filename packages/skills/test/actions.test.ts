import { describe, it, expect } from "vitest";
import { actions, actionsByName } from "../src/actions/index.js";
import { StoaAgent } from "../src/agent.js";

// A well-known throwaway test key (Hardhat account #0). Never used with real funds.
const TEST_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" as const;

describe("skill suite integrity", () => {
  it("exposes a large suite with unique upper-snake names", () => {
    expect(actions.length).toBeGreaterThan(100);
    const names = actions.map((a) => a.name);
    expect(new Set(names).size).toBe(names.length); // all unique
    for (const name of names) {
      expect(name).toMatch(/^[A-Z0-9_]+$/);
    }
  });

  it("includes the seven flagship commerce skills", () => {
    for (const name of [
      "X402_PAY",
      "X402_MONETIZE",
      "AGENT_IDENTITY",
      "REPUTATION",
      "AGENT_ESCROW",
      "TREASURY_GUARD",
      "SERVICE_LISTING",
    ]) {
      expect(actionsByName[name]).toBeDefined();
    }
  });

  it("every skill has a description, similes, schema, and handler", () => {
    for (const a of actions) {
      expect(a.description.length).toBeGreaterThan(20);
      expect(a.similes.length).toBeGreaterThan(0);
      expect(a.schema).toBeDefined();
      expect(typeof a.handler).toBe("function");
      expect(a.examples.length).toBeGreaterThan(0);
    }
  });

  it("indexes skills by name", () => {
    expect(actionsByName.X402_PAY).toBeDefined();
    expect(actionsByName.AGENT_ESCROW?.name).toBe("AGENT_ESCROW");
  });
});

describe("skill guards fail safely without on-chain config", () => {
  const agent = new StoaAgent({ privateKey: TEST_KEY });

  it("agent_identity errors clearly when the registry is not configured", async () => {
    const res = await actionsByName.AGENT_IDENTITY!.handler(agent, { op: "resolve", agentId: 1 });
    expect(res.status).toBe("error");
    expect(res.message).toContain("registry");
  });

  it("treasury_guard blocks a recipient that is not on the allowlist (no network call)", async () => {
    const res = await actionsByName.TREASURY_GUARD!.handler(agent, {
      to: "0x1111111111111111111111111111111111111111",
      amount: "0.1",
      token: "native",
      allowlist: ["0x2222222222222222222222222222222222222222"],
      dryRun: true,
    });
    expect(res.status).toBe("error");
    expect(res.message).toContain("allowlist");
  });
});
