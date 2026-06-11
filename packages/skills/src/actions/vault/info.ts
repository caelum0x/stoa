import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { agentVaultAbi } from "../../abi/agentVault.js";

export const vaultInfoSchema = z.object({});

/// SKILL: vault_info — read the agent vault configuration and counters.
export const vaultInfoAction: Action<typeof vaultInfoSchema> = {
  name: "VAULT_INFO",
  similes: ["vault info", "multisig config", "vault threshold", "vault owners"],
  description:
    "Read the AgentVault configuration: confirmation threshold, owner count, and total transaction count.",
  examples: [
    {
      input: {},
      output: ok("Vault info read", { threshold: 2, ownerCount: 3, txCount: 5 }),
      explanation: "Reports a 2-of-3 vault with five proposals so far.",
    },
  ],
  schema: vaultInfoSchema,
  handler: async (agent) => {
    try {
      const vault = agent.requireContract("vault");
      const [threshold, ownerCount, txCount] = await Promise.all([
        agent.publicClient.readContract({ address: vault, abi: agentVaultAbi, functionName: "threshold" }),
        agent.publicClient.readContract({ address: vault, abi: agentVaultAbi, functionName: "ownerCount" }),
        agent.publicClient.readContract({ address: vault, abi: agentVaultAbi, functionName: "txCount" }),
      ]);
      return ok("Vault info read", {
        threshold: Number(threshold),
        ownerCount: Number(ownerCount),
        txCount: Number(txCount),
      });
    } catch (e) {
      return fail(`vault_info failed: ${errorMessage(e)}`);
    }
  },
};
