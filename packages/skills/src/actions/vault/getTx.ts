import { z } from "zod";
import { formatEther } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { agentVaultAbi } from "../../abi/agentVault.js";

export const vaultGetTxSchema = z.object({
  txId: z.coerce.number().int().nonnegative().describe("Vault transaction id to read."),
});

/// SKILL: vault_get_tx — read the state of a vault transaction proposal.
export const vaultGetTxAction: Action<typeof vaultGetTxSchema> = {
  name: "VAULT_GET_TX",
  similes: ["get vault tx", "read multisig tx", "vault tx status", "inspect proposal"],
  description:
    "Read a single AgentVault transaction proposal: destination, value, calldata, executed flag, and confirmation count.",
  examples: [
    {
      input: { txId: 0 },
      output: ok("Vault transaction read", { to: "0xabc", value: "1.5", executed: false, confirmations: 1 }),
      explanation: "Reads proposal 0 with one confirmation so far.",
    },
  ],
  schema: vaultGetTxSchema,
  handler: async (agent, input) => {
    try {
      const vault = agent.requireContract("vault");
      const [to, value, data, executed, confirmations] = await agent.publicClient.readContract({
        address: vault,
        abi: agentVaultAbi,
        functionName: "getTransaction",
        args: [BigInt(input.txId)],
      });
      return ok("Vault transaction read", {
        txId: input.txId,
        to,
        value: formatEther(value),
        data,
        executed,
        confirmations: Number(confirmations),
      });
    } catch (e) {
      return fail(`vault_get_tx failed: ${errorMessage(e)}`);
    }
  },
};
