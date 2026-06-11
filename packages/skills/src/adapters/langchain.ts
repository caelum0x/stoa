import { DynamicStructuredTool } from "@langchain/core/tools";
import type { StoaAgent } from "../agent.js";
import { actions } from "../actions/index.js";

/// Build LangChain tools for every Stoa skill, bound to a given agent.
/// Each tool returns a JSON string of the skill's ActionResult.
export function createLangchainTools(agent: StoaAgent): DynamicStructuredTool[] {
  return actions.map(
    (action) =>
      new DynamicStructuredTool({
        name: action.name,
        description: action.description,
        schema: action.schema,
        func: async (input: unknown) => {
          const result = await action.handler(agent, input);
          return JSON.stringify(result);
        },
      }),
  );
}
