import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { agentVaultAbi } from "../../abi/agentVault.js";

export const vaultExecuteSchema = z.object({
  txId: z.coerce.number().int().nonnegative().describe("Vault transaction id to execute."),
});

/// SKILL: vault_execute — execute a fully-confirmed multisig transaction.
export const vaultExecuteAction: Action<typeof vaultExecuteSchema> = {
  name: "VAULT_EXECUTE",
  similes: ["execute vault tx", "run multisig", "settle vault tx", "vault execute"],
  description:
    "Execute an AgentVault transaction that has met its confirmation threshold, dispatching the funds and calldata.",
  examples: [
    {
      input: { txId: 0 },
      output: ok("Vault transaction executed", { txId: 0, txHash: "0x..." }),
      explanation: "Executes proposal 0 once enough confirmations exist.",
    },
  ],
  schema: vaultExecuteSchema,
  handler: async (agent, input) => {
    try {
      const vault = agent.requireContract("vault");
      const hash = await agent.walletClient.writeContract({
        address: vault,
        abi: agentVaultAbi,
        functionName: "execute",
        args: [BigInt(input.txId)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Vault transaction executed", { txId: input.txId, txHash: hash });
    } catch (e) {
      return fail(`vault_execute failed: ${errorMessage(e)}`);
    }
  },
};
