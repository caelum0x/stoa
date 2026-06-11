import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { ZodRawShape, ZodObject } from "zod";
import { StoaAgent } from "../agent.js";
import { actions } from "../actions/index.js";

/// Build an MCP server exposing every Stoa skill as an MCP tool.
export function createStoaMcpServer(agent: StoaAgent): McpServer {
  const server = new McpServer({ name: "stoa-skills", version: "0.1.0" });

  for (const action of actions) {
    const shape = (action.schema as ZodObject<ZodRawShape>).shape;
    server.tool(action.name, action.description, shape, async (input: unknown) => {
      const result = await action.handler(agent, input);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        isError: result.status === "error",
      };
    });
  }

  return server;
}

/// Run the server over stdio when invoked directly (e.g. `pnpm --filter @stoa/skills mcp`).
async function main(): Promise<void> {
  const agent = StoaAgent.fromEnv();
  const server = createStoaMcpServer(agent);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // eslint-disable-next-line no-console
  console.error(`[stoa] MCP server ready — agent ${agent.address} on chain ${agent.chain.id}`);
}

// Execute only when run as the entry module, not when imported.
const isEntry =
  typeof process !== "undefined" &&
  process.argv[1] !== undefined &&
  import.meta.url === `file://${process.argv[1]}`;

if (isEntry) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[stoa] MCP server failed to start:", err);
    process.exit(1);
  });
}
