import type { z } from "zod";
import type { StoaAgent } from "./agent.js";

/// Result envelope returned by every skill handler. Mirrors the Pharos Agent Kit
/// `{ status, data, message }` shape so Stoa skills drop in natively.
export type ActionStatus = "success" | "error";

export interface ActionResult<T = unknown> {
  status: ActionStatus;
  data?: T;
  message: string;
}

export interface ActionExample {
  input: Record<string, unknown>;
  output: ActionResult;
  explanation: string;
}

/// A Stoa Skill, expressed as a Pharos Agent Kit-compatible action.
///
/// `name`     — unique upper-snake identifier (e.g. "X402_PAY").
/// `similes`  — natural-language aliases for intent matching.
/// `schema`   — Zod schema validating + documenting the input.
/// `handler`  — receives the agent context and validated input, returns an ActionResult.
export interface Action<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  similes: string[];
  description: string;
  examples: ActionExample[];
  schema: TSchema;
  // Declared as a method (not an arrow property) so parameters are checked bivariantly.
  // This lets a specific `Action<SomeSchema>` be assigned into a general `Action[]`,
  // which the domain registries rely on.
  handler(agent: StoaAgent, input: z.infer<TSchema>): Promise<ActionResult>;
}

/// Helper constructors for consistent results.
export const ok = <T>(message: string, data?: T): ActionResult<T> => ({
  status: "success",
  message,
  ...(data === undefined ? {} : { data }),
});

export const fail = (message: string): ActionResult => ({
  status: "error",
  message,
});

/// Narrow an unknown thrown value to a readable message.
export const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
