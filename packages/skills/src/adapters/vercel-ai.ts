import { tool, type Tool } from "ai";
import type { StoaAgent } from "../agent.js";
import { actions } from "../actions/index.js";

/// Build a Vercel AI SDK tool set (keyed by skill name) bound to a given agent.
/// Pass directly to `generateText`/`streamText` via the `tools` option.
export function createVercelTools(agent: StoaAgent): Record<string, Tool> {
  return Object.fromEntries(
    actions.map((action) => [
      action.name,
      tool({
        description: action.description,
        parameters: action.schema,
        execute: async (input: unknown) => action.handler(agent, input),
      }),
    ]),
  );
}
