/// A single recorded step in an agent run: which skill ran, its human-readable
/// result, and the on-chain transaction hash if one was produced.
export interface TraceStep {
  skill: string;
  result: string;
  tx?: string;
}

/// Accumulates an ordered, serializable trace of a single agent run.
///
/// The `runId` is supplied by the caller and kept verbatim so traces stay
/// deterministic and reproducible (no `Date.now`/`Math.random` inside).
export class TraceWriter {
  private steps: TraceStep[] = [];
  private readonly runId: string;

  constructor(runId: string) {
    this.runId = runId;
  }

  /// Append a step to the trace.
  record(step: TraceStep): void {
    this.steps = [...this.steps, step];
  }

  /// Serialize the full trace for logging or persistence.
  toJSON(): { runId: string; steps: TraceStep[] } {
    return { runId: this.runId, steps: [...this.steps] };
  }
}
