// @stoa/sdk — pure treasury policy checks.
//
// No chain access: these are deterministic string/number checks over a
// `TreasuryPolicy`, suitable for pre-flight validation before submitting a
// guarded transfer on-chain.

import type { TreasuryPolicy } from "../types.js";

export type { TreasuryPolicy } from "../types.js";

/// Result of evaluating a transfer against a treasury policy.
export interface PolicyCheck {
  ok: boolean;
  reason?: string;
}

/// Check whether a transfer of `amount` (human units) to `to` satisfies `policy`.
/// Pure — performs allowlist membership and a numeric `maxPerTx` comparison only.
export function isWithinPolicy(
  policy: TreasuryPolicy,
  amount: string,
  to: string,
): PolicyCheck {
  if (policy.allowlist && policy.allowlist.length > 0) {
    const target = to.toLowerCase();
    const allowed = policy.allowlist.some((entry) => entry.toLowerCase() === target);
    if (!allowed) {
      return { ok: false, reason: `Recipient ${to} is not in the allowlist.` };
    }
  }

  if (policy.maxPerTx !== undefined) {
    const requested = Number(amount);
    const limit = Number(policy.maxPerTx);
    if (!Number.isFinite(requested)) {
      return { ok: false, reason: `Invalid transfer amount: ${amount}` };
    }
    if (requested > limit) {
      return {
        ok: false,
        reason: `Transfer ${amount} exceeds maxPerTx ${policy.maxPerTx}.`,
      };
    }
  }

  return { ok: true };
}
