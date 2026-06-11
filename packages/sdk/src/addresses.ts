// @stoa/sdk — load Stoa contract addresses from the environment.

import type { StoaContracts } from "@stoa/skills";

/// Parse a value as a 0x-prefixed hex address, or return undefined.
function asAddress(value: string | undefined): `0x${string}` | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return undefined;
  return trimmed as `0x${string}`;
}

/// Read Stoa contract addresses from environment variables.
///
/// Recognizes `STOA_REGISTRY_ADDRESS`, `STOA_ESCROW_ADDRESS`,
/// `STOA_SERVICES_ADDRESS`, `STOA_SOCIAL_ADDRESS`, and `STOA_TIPJAR_ADDRESS`.
/// Only keys whose value is a valid `0x` address are included in the result.
export function loadAddressesFromEnv(
  env: Record<string, string | undefined> = process.env,
): StoaContracts {
  const contracts: StoaContracts = {};

  const registry = asAddress(env["STOA_REGISTRY_ADDRESS"]);
  if (registry) contracts.registry = registry;

  const escrow = asAddress(env["STOA_ESCROW_ADDRESS"]);
  if (escrow) contracts.escrow = escrow;

  const services = asAddress(env["STOA_SERVICES_ADDRESS"]);
  if (services) contracts.services = services;

  const social = asAddress(env["STOA_SOCIAL_ADDRESS"]);
  if (social) contracts.social = social;

  const tipJar = asAddress(env["STOA_TIPJAR_ADDRESS"]);
  if (tipJar) contracts.tipJar = tipJar;

  return contracts;
}
