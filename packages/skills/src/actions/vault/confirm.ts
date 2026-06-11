import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { agentVaultAbi } from "../../abi/agentVault.js";

export const vaultConfirmSchema = z.object({
  txId: z.coerce.number().int().nonnegative().describe("Vault transaction id to confirm."),
});

/// SKILL: vault_confirm — confirm a pending multisig transaction.
export const vaultConfirmAction: Action<typeof vaultConfirmSchema> = {
  name: "VAULT_CONFIRM",
  similes: ["confirm vault tx", "approve multisig", "sign vault tx", "vault approve"],
  description:
    "Confirm a pending AgentVault transaction proposal, adding the caller's approval toward the threshold.",
  examples: [
    {
      input: { txId: 0 },
      output: ok("Vault transaction confirmed", { txId: 0, txHash: "0x..." }),
      explanation: "Confirms proposal 0.",
    },
  ],
  schema: vaultConfirmSchema,
  handler: async (agent, input) => {
    try {
      const vault = agent.requireContract("vault");
      const hash = await agent.walletClient.writeContract({
        address: vault,
        abi: agentVaultAbi,
        functionName: "confirm",
        args: [BigInt(input.txId)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Vault transaction confirmed", { txId: input.txId, txHash: hash });
    } catch (e) {
      return fail(`vault_confirm failed: ${errorMessage(e)}`);
    }
  },
};
