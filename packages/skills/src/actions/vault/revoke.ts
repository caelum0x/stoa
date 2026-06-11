import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { agentVaultAbi } from "../../abi/agentVault.js";

export const vaultRevokeSchema = z.object({
  txId: z.coerce.number().int().nonnegative().describe("Vault transaction id to revoke confirmation for."),
});

/// SKILL: vault_revoke — revoke a previously given confirmation.
export const vaultRevokeAction: Action<typeof vaultRevokeSchema> = {
  name: "VAULT_REVOKE",
  similes: ["revoke vault confirmation", "unsign multisig", "withdraw approval", "vault revoke"],
  description:
    "Revoke the caller's confirmation on a pending AgentVault transaction, lowering its approval count.",
  examples: [
    {
      input: { txId: 0 },
      output: ok("Vault confirmation revoked", { txId: 0, txHash: "0x..." }),
      explanation: "Revokes the caller's approval of proposal 0.",
    },
  ],
  schema: vaultRevokeSchema,
  handler: async (agent, input) => {
    try {
      const vault = agent.requireContract("vault");
      const hash = await agent.walletClient.writeContract({
        address: vault,
        abi: agentVaultAbi,
        functionName: "revokeConfirmation",
        args: [BigInt(input.txId)],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Vault confirmation revoked", { txId: input.txId, txHash: hash });
    } catch (e) {
      return fail(`vault_revoke failed: ${errorMessage(e)}`);
    }
  },
};
