import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { faucetAbi } from "../../abi/faucet.js";

export const faucetDripSchema = z.object({});

/// SKILL: faucet_drip — claim native PHRS from the testnet faucet.
export const faucetDripAction: Action<typeof faucetDripSchema> = {
  name: "FAUCET_DRIP",
  similes: ["faucet drip", "claim testnet phrs", "get test tokens", "request faucet"],
  description: "Claim native PHRS from the Pharos testnet faucet (subject to its cooldown).",
  examples: [
    { input: {}, output: ok("Faucet drip claimed", { txHash: "0x..." }), explanation: "Drips PHRS to the agent." },
  ],
  schema: faucetDripSchema,
  handler: async (agent) => {
    try {
      const faucet = agent.requireContract("faucet");
      const hash = await agent.walletClient.writeContract({
        address: faucet,
        abi: faucetAbi,
        functionName: "drip",
        args: [],
      });
      await agent.publicClient.waitForTransactionReceipt({ hash });
      return ok("Faucet drip claimed", { faucet, account: agent.address, txHash: hash });
    } catch (e) {
      return fail(`faucet_drip failed: ${errorMessage(e)}`);
    }
  },
};
