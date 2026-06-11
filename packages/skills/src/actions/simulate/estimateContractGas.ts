import { z } from "zod";
import { parseEther, type Abi } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const estimateContractGasSchema = z.object({
  address: addressSchema.describe("Contract address to call."),
  abi: z.string().describe("Contract ABI as a JSON string."),
  functionName: z.string().describe("Name of the contract function to estimate."),
  args: z.array(z.unknown()).optional().describe("Optional positional arguments for the function."),
  value: decimalAmountSchema.optional().describe("Optional PHRS value in decimal units."),
});

/// SKILL: estimate_contract_gas — estimate gas for a contract function call on Pharos.
export const estimateContractGasAction: Action<typeof estimateContractGasSchema> = {
  name: "ESTIMATE_CONTRACT_GAS",
  similes: ["estimate gas", "contract gas", "gas estimate", "estimate call gas"],
  description: "Estimate the gas required to execute a contract function call against Pharos.",
  examples: [
    {
      input: {
        address: "0x0000000000000000000000000000000000000000",
        abi: "[]",
        functionName: "totalSupply",
      },
      output: ok("Estimated gas", { gas: "21000" }),
      explanation: "Estimates gas for a contract read/write call.",
    },
  ],
  schema: estimateContractGasSchema,
  handler: async (agent, input) => {
    try {
      const abi = JSON.parse(input.abi) as Abi;
      const gas = await agent.publicClient.estimateContractGas({
        account: agent.account,
        address: input.address,
        abi,
        functionName: input.functionName,
        args: input.args ?? [],
        ...(input.value === undefined ? {} : { value: parseEther(input.value) }),
      });
      return ok("Estimated gas", { gas: gas.toString() });
    } catch (e) {
      return fail(`estimate_contract_gas failed: ${errorMessage(e)}`);
    }
  },
};
