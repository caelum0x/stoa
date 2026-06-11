import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const clientVersionSchema = z.object({});

/// SKILL: client_version — node software version via web3_clientVersion.
export const clientVersionAction: Action<typeof clientVersionSchema> = {
  name: "CLIENT_VERSION",
  similes: ["client version", "node version", "web3 client version", "node software"],
  description: "Return the Pharos node's client software version string via the web3_clientVersion JSON-RPC method.",
  examples: [
    {
      input: {},
      output: ok("Client version", { version: "Geth/v1.13.0" }),
      explanation: "Reads the node's reported client version.",
    },
  ],
  schema: clientVersionSchema,
  handler: async (agent, _input) => {
    try {
      const result = await agent.publicClient.request({
        method: "web3_clientVersion",
        params: [],
      } as any);
      const version = typeof result === "string" ? result : String(result ?? "");
      return ok("Client version", { version });
    } catch (e) {
      return fail(`client_version failed: ${errorMessage(e)}`);
    }
  },
};
