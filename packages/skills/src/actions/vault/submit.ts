import { z } from "zod";
import { parseEther, parseEventLogs } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { agentVaultAbi } from "../../abi/agentVault.js";
import { addressSchema, decimalAmountSchema } from "../../schemas.js";

export const vaultSubmitSchema = z.object({
  to: addressSchema.describe("Destination address for the proposed transaction."),
  value: decimalAmountSchema.describe("Native PHRS amount to send, human units."),
  data: z
    .string()
    .regex(/^0x[a-fA-F0-9]*$/, "Must be 0x-prefixed hex")
    .optional()
    .describe('Optional calldata payload, defaults to "0x".'),
});

/// SKILL: vault_submit — propose a multisig transaction in the agent vault.
export const vaultSubmitAction: Action<typeof vaultSubmitSchema> = {
  name: "VAULT_SUBMIT",
  similes: ["submit vault tx", "propose transaction", "new multisig tx", "vault propose"],
  description:
    "Submit a new transaction proposal to the AgentVault multisig, sending native PHRS and optional calldata.",
  examples: [
    {
      input: { to: "0xabc", value: "1.5" },
      output: ok("Vault transaction submitted", { txId: "0", txHash: "0x..." }),
      explanation: "Proposes sending 1.5 PHRS to a recipient.",
    },
  ],
  schema: vaultSubmitSchema,
  handler: async (agent, input) => {
    try {
      const vault = agent.requireContract("vault");
      const data = (input.data ?? "0x") as `0x${string}`;
      const hash = await agent.walletClient.writeContract({
        address: vault,
        abi: agentVaultAbi,
        functionName: "submit",
        args: [input.to, parseEther(input.value), data],
      });
      const receipt = await agent.publicClient.waitForTransactionReceipt({ hash });
      const events = parseEventLogs({ abi: agentVaultAbi, logs: receipt.logs, eventName: "Submitted" });
      const txId = events[0]?.args.txId;
      return ok("Vault transaction submitted", {
        txId: txId !== undefined ? txId.toString() : undefined,
        to: input.to,
        value: input.value,
        txHash: hash,
      });
    } catch (e) {
      return fail(`vault_submit failed: ${errorMessage(e)}`);
    }
  },
};
