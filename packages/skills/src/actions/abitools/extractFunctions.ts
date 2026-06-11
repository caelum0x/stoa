import { z } from "zod";
import { formatAbiItem } from "viem/utils";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const extractFunctionsSchema = z.object({
  abi: z.string().describe("A JSON-stringified ABI array to extract functions from."),
});

interface AbiNamed {
  type?: string;
  name?: string;
}

/// SKILL: extract_functions — list function names and signatures from a JSON ABI.
export const extractFunctionsAction: Action<typeof extractFunctionsSchema> = {
  name: "EXTRACT_FUNCTIONS",
  similes: ["extract functions", "list functions", "abi functions", "function signatures"],
  description: "List all function names and human-readable signatures contained in a JSON ABI.",
  examples: [
    {
      input: { abi: "[{\"type\":\"function\",\"name\":\"transfer\",\"inputs\":[],\"outputs\":[]}]" },
      output: ok("Functions", { names: ["transfer"], signatures: ["function transfer()"] }),
      explanation: "Extracts function names and signatures from the ABI.",
    },
  ],
  schema: extractFunctionsSchema,
  handler: async (_agent, input) => {
    try {
      const parsed = JSON.parse(input.abi) as AbiNamed[];
      const functions = parsed.filter((item) => item.type === "function");
      const names = functions.map((item) => item.name ?? "");
      const signatures = functions.map((item) => formatAbiItem(item as never));
      return ok("Functions", { names, signatures });
    } catch (e) {
      return fail(`extract_functions failed: ${errorMessage(e)}`);
    }
  },
};
