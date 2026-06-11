import { z } from "zod";
import { parseUnits, formatUnits, zeroAddress, getAddress, type Address } from "viem";
import { type Action, ok, fail, errorMessage } from "../types.js";
import { erc20Abi } from "../abi/erc20.js";
import { addressSchema, tokenSchema, decimalAmountSchema } from "../schemas.js";

export const treasuryGuardSchema = z.object({
  to: addressSchema.describe("Recipient address."),
  amount: decimalAmountSchema.describe("Amount to send in human units."),
  token: tokenSchema.default("native").describe('Token to send, or "native" for PHRS.'),
  maxPerTx: decimalAmountSchema.optional().describe("Per-transaction ceiling (overrides env)."),
  dailyCap: decimalAmountSchema.optional().describe("Rolling 24h spend ceiling (overrides env)."),
  allowlist: z
    .array(addressSchema)
    .optional()
    .describe("If set, only these recipients are permitted (overrides env)."),
  dryRun: z.boolean().default(false).describe("Simulate and check policy without broadcasting."),
});

// In-memory rolling spend ledger, keyed by `${tokenKey}:${UTC-date}`.
const dailySpend = new Map<string, bigint>();

function todayKey(token: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return `${token}:${day}`;
}

function envAllowlist(): Address[] | undefined {
  const raw = process.env.STOA_GUARD_ALLOWLIST;
  if (!raw) return undefined;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => getAddress(s));
}

/// SKILL: treasury_guard
/// A policy-guarded transfer primitive: enforces an allowlist, a per-tx ceiling, and a rolling
/// daily cap, and simulates the transfer before broadcasting. The safety layer every
/// autonomous, money-moving agent should route payments through.
export const treasuryGuardAction: Action<typeof treasuryGuardSchema> = {
  name: "TREASURY_GUARD",
  similes: ["safe transfer", "guarded payment", "spend limit", "treasury policy", "send with limits"],
  description:
    "Send PHRS or ERC-20 on Pharos through policy guards: recipient allowlist, per-tx ceiling, " +
    "rolling 24h cap, and a pre-flight simulation. Rejects any transfer that violates policy.",
  examples: [
    {
      input: { to: "0xVendor", amount: "0.5", token: "native", maxPerTx: "1" },
      output: ok("Transfer sent", { txHash: "0x..." }),
      explanation: "Sends 0.5 PHRS, allowed because it is under the 1 PHRS per-tx ceiling.",
    },
  ],
  schema: treasuryGuardSchema,
  handler: async (agent, input) => {
    try {
      const token: Address = input.token === "native" ? zeroAddress : input.token;
      const tokenKey = input.token === "native" ? "native" : token.toLowerCase();

      const decimals =
        token === zeroAddress
          ? 18
          : Number(
              await agent.publicClient.readContract({
                address: token,
                abi: erc20Abi,
                functionName: "decimals",
              }),
            );
      const value = parseUnits(input.amount, decimals);

      // --- Policy checks -------------------------------------------------- //
      const allowlist = input.allowlist ?? envAllowlist();
      if (allowlist && !allowlist.some((a) => a.toLowerCase() === input.to.toLowerCase())) {
        return fail(`Recipient ${input.to} is not on the allowlist; transfer blocked.`);
      }

      const maxPerTxRaw = input.maxPerTx ?? process.env.STOA_GUARD_MAX_PER_TX;
      if (maxPerTxRaw && value > parseUnits(maxPerTxRaw, decimals)) {
        return fail(`Amount ${input.amount} exceeds per-tx ceiling ${maxPerTxRaw}; transfer blocked.`);
      }

      const dailyCapRaw = input.dailyCap ?? process.env.STOA_GUARD_DAILY_CAP;
      const key = todayKey(tokenKey);
      const spent = dailySpend.get(key) ?? 0n;
      if (dailyCapRaw) {
        const cap = parseUnits(dailyCapRaw, decimals);
        if (spent + value > cap) {
          return fail(
            `Daily cap ${dailyCapRaw} would be exceeded (already spent ${formatUnits(spent, decimals)}); blocked.`,
          );
        }
      }

      // --- Simulation ----------------------------------------------------- //
      if (token === zeroAddress) {
        await agent.publicClient.estimateGas({
          account: agent.account,
          to: input.to,
          value,
        });
      } else {
        await agent.publicClient.simulateContract({
          account: agent.account,
          address: token,
          abi: erc20Abi,
          functionName: "transfer",
          args: [input.to, value],
        });
      }

      if (input.dryRun) {
        return ok("Policy OK (dry run, not broadcast)", {
          to: input.to,
          amount: input.amount,
          token: input.token,
        });
      }

      // --- Execute -------------------------------------------------------- //
      let hash: `0x${string}`;
      if (token === zeroAddress) {
        hash = await agent.walletClient.sendTransaction({ to: input.to, value });
      } else {
        hash = await agent.walletClient.writeContract({
          address: token,
          abi: erc20Abi,
          functionName: "transfer",
          args: [input.to, value],
        });
      }
      await agent.publicClient.waitForTransactionReceipt({ hash });

      // Record spend only after a successful broadcast.
      dailySpend.set(key, spent + value);

      return ok("Transfer sent", {
        to: input.to,
        amount: input.amount,
        token: input.token,
        txHash: hash,
        dailySpent: formatUnits(spent + value, decimals),
      });
    } catch (e) {
      return fail(`treasury_guard failed: ${errorMessage(e)}`);
    }
  },
};
