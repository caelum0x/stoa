import type { StoaAgent } from "./agent.js";
import { actions } from "./actions/index.js";

// Minimal, dependency-free shapes matching the ElizaOS plugin/action contract. Declared locally so
// this adapter type-checks and builds without @elizaos/core installed; at runtime ElizaOS consumes
// the returned plain object directly.
type ElizaCallback = (response: { text: string; content?: unknown }) => void;

export interface ElizaAction {
  name: string;
  similes: string[];
  description: string;
  validate: (runtime: unknown, message: unknown) => Promise<boolean>;
  handler: (
    runtime: unknown,
    message: unknown,
    state: unknown,
    options: Record<string, unknown> | undefined,
    callback?: ElizaCallback,
  ) => Promise<boolean>;
  examples: unknown[];
}

export interface ElizaPlugin {
  name: string;
  description: string;
  actions: ElizaAction[];
}

/// Build an ElizaOS plugin exposing every Stoa skill as an Eliza action, bound to a given agent.
/// The skill input is taken from the action `options` object; the result is delivered via callback
/// and also returned (true on success, false on a skill error).
export function createElizaPlugin(agent: StoaAgent): ElizaPlugin {
  return {
    name: "stoa",
    description: "Stoa — agent commerce skills for Pharos (payments, identity, escrow, social, DeFi).",
    actions: actions.map<ElizaAction>((action) => ({
      name: action.name,
      similes: action.similes,
      description: action.description,
      validate: async () => true,
      handler: async (_runtime, _message, _state, options, callback) => {
        const parsed = action.schema.safeParse(options ?? {});
        if (!parsed.success) {
          callback?.({ text: `Invalid input for ${action.name}: ${parsed.error.message}` });
          return false;
        }
        const result = await action.handler(agent, parsed.data);
        callback?.({ text: result.message, content: result.data });
        return result.status === "success";
      },
      examples: [],
    })),
  };
}
