import { z } from "zod";
import { parseEther, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const rawCallSchema = z.object({
  to: addressSchema.describe("Target contract or account address."),
  data: z
    .string()
    .regex(/^0x[0-9a-fA-F]*$/, "Must be 0x-prefixed hex calldata")
    .describe("0x-prefixed calldata to send."),
  value: decimalAmountSchema.optional().describe("Optional PHRS value in decimal units."),
});

/// SKILL: raw_call — simulate a low-level eth_call against Pharos without sending a tx.
export const rawCallAction: Action<typeof rawCallSchema> = {
  name: "RAW_CALL",
  similes: ["eth_call", "simulate call", "raw call", "static call", "read calldata"],
  description: "Simulate a low-level call (eth_call) with raw calldata and return the returned 0x bytes.",
  examples: [
    {
      input: { to: "0x0000000000000000000000000000000000000000", data: "0x" },
      output: ok("Call result", { data: "0x" }),
      explanation: "Simulates an empty call to the zero address.",
    },
  ],
  schema: rawCallSchema,
  handler: async (agent, input) => {
    try {
      const result = await agent.publicClient.call({
        account: agent.account,
        to: input.to,
        data: input.data as Hex,
        ...(input.value === undefined ? {} : { value: parseEther(input.value) }),
      });
      return ok("Call result", { data: result.data ?? "0x" });
    } catch (e) {
      return fail(`raw_call failed: ${errorMessage(e)}`);
    }
  },
};
