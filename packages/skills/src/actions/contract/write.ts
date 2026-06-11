import { z } from "zod";
import { parseEther, type Abi } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const contractWriteSchema = z.object({
  address: addressSchema.describe("Contract address to write to."),
  abi: z.string().describe("Contract ABI as a JSON string."),
  functionName: z.string().describe("State-changing function name to call."),
  args: z.array(z.unknown()).optional().describe("Function arguments (default empty)."),
  value: decimalAmountSchema.optional().describe("Native PHRS to send, decimal units."),
});

/// SKILL: contract_write — send a state-changing transaction to any contract.
export const contractWriteAction: Action<typeof contractWriteSchema> = {
  name: "CONTRACT_WRITE",
  similes: ["write contract", "call function", "send transaction", "invoke contract"],
  description: "Send a state-changing transaction to any contract using a supplied ABI; waits for the receipt.",
  examples: [
    {
      input: { address: "0xabc", abi: "[...]", functionName: "mint", args: ["0xdef", "1"] },
      output: ok("Transaction sent", { txHash: "0x..." }),
      explanation: "Writes to a contract and returns the tx hash.",
    },
  ],
  schema: contractWriteSchema,
  handler: async (agent, input) => {
    try {
      const abi = JSON.parse(input.abi) as Abi;
      const value = input.value !== undefined ? parseEther(input.value) : undefined;
      const hash = await agent.walletClient.writeContract({
        address: input.address,
        abi,
        functionName: input.functionName,
        args: input.args ?? [],
        ...(value !== undefined ? { value } : {}),
        account: agent.account,
        chain: agent.chain,
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Transaction sent", {
        address: input.address,
        functionName: input.functionName,
        txHash: hash,
      });
    } catch (e) {
      return fail(`contract_write failed: ${errorMessage(e)}`);
    }
  },
};
