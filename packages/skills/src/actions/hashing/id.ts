import { z } from "zod";
import { keccak256, stringToHex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const idSchema = z.object({
  signature: z.string().describe("Function or event signature, e.g. \"Transfer(address,address,uint256)\"."),
});

/// SKILL: id_hash — keccak-256 of a signature string, used for event topics / function ids.
export const idAction: Action<typeof idSchema> = {
  name: "ID_HASH",
  similes: ["event topic", "function selector hash", "signature hash", "ethers id", "topic hash"],
  description: "Compute keccak-256 of a function or event signature string (the event topic / function id).",
  examples: [
    {
      input: { signature: "Transfer(address,address,uint256)" },
      output: ok("Signature id", { hash: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" }),
      explanation: "Computes the topic hash of the ERC-20 Transfer event.",
    },
  ],
  schema: idSchema,
  handler: async (_agent, input) => {
    try {
      return ok("Signature id", { hash: keccak256(stringToHex(input.signature)) });
    } catch (e) {
      return fail(`id_hash failed: ${errorMessage(e)}`);
    }
  },
};
