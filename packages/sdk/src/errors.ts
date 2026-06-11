// @stoa/sdk — typed error hierarchy.
//
// All SDK errors extend `StoaError`, which carries a stable `code` string so
// callers can branch on error kind without relying on `instanceof` or message
// parsing.

/// Base class for all Stoa SDK errors.
export class StoaError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "StoaError";
    this.code = code;
  }
}

/// Thrown when an operation requires a contract address that was not configured.
export class ContractNotConfiguredError extends StoaError {
  constructor(message: string) {
    super(message, "CONTRACT_NOT_CONFIGURED");
    this.name = "ContractNotConfiguredError";
  }
}

/// Thrown when an underlying skill returns an error result.
export class SkillFailedError extends StoaError {
  constructor(message: string) {
    super(message, "SKILL_FAILED");
    this.name = "SkillFailedError";
  }
}

/// Thrown when input fails validation at an SDK boundary.
export class ValidationError extends StoaError {
  constructor(message: string) {
    super(message, "VALIDATION");
    this.name = "ValidationError";
  }
}
