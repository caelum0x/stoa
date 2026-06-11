import { z } from "zod";

/// A 0x-prefixed 20-byte EVM address.
export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a 0x-prefixed 20-byte address")
  .transform((v) => v as `0x${string}`);

/// A decimal string amount in human units (e.g. "1.5"). Kept as a string to avoid
/// float precision loss; converted with viem's parseUnits at the boundary.
export const decimalAmountSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/, "Must be a non-negative decimal string, e.g. \"1.5\"");

/// Positive integer-as-string (wei / smallest-unit) when callers want exact control.
export const baseUnitsSchema = z.string().regex(/^\d+$/, "Must be an integer string in base units");

export const tokenSchema = z
  .union([addressSchema, z.literal("native")])
  .describe('ERC-20 token address, or "native" for PHRS.');

export const agentIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .describe("On-chain agent id from StoaRegistry.");
