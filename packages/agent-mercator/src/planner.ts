/// A seller the buyer is considering hiring, with the normalized signals used to rank it.
/// Each numeric field is expected to be a 0..1 score where higher is better.
export interface SellerCandidate {
  agentId: number;
  reputation: number;
  priceFit: number;
  successfulJobs: number;
  responseTime: number;
}

const WEIGHTS = {
  reputation: 0.45,
  priceFit: 0.25,
  successfulJobs: 0.2,
  responseTime: 0.1,
} as const;

/// Weighted score for a candidate seller. Higher is better.
export function scoreSeller(c: SellerCandidate): number {
  return (
    c.reputation * WEIGHTS.reputation +
    c.priceFit * WEIGHTS.priceFit +
    c.successfulJobs * WEIGHTS.successfulJobs +
    c.responseTime * WEIGHTS.responseTime
  );
}

/// Pick the highest-scoring candidate, or `null` when the list is empty.
export function pickBestSeller(cands: SellerCandidate[]): SellerCandidate | null {
  if (cands.length === 0) return null;

  let best = cands[0]!;
  let bestScore = scoreSeller(best);

  for (let i = 1; i < cands.length; i += 1) {
    const candidate = cands[i]!;
    const score = scoreSeller(candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}
