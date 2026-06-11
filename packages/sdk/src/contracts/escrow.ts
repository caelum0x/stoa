// @stoa/sdk — typed read helpers for the StoaEscrow contract.
//
// Thin wrapper over a StoaAgent's viem public client. Converts the on-chain job
// struct into a JSON-safe summary: addresses pass through, the state enum becomes
// a numeric index, and wei amounts are formatted to human-readable ether strings.

import { formatEther } from "viem";
import { stoaEscrowAbi, type StoaAgent } from "@stoa/skills";

/// A JSON-safe summary of an escrow job and its milestones.
export interface EscrowJobSummary {
  jobId: number;
  payer: `0x${string}`;
  payee: `0x${string}`;
  arbiter: `0x${string}`;
  token: `0x${string}`;
  deadline: string;
  /// Numeric state index (0=Active, 1=Completed, 2=Refunded — see ESCROW_STATE).
  state: number;
  /// Total escrowed amount, formatted as an ether string.
  total: string;
  /// Released amount so far, formatted as an ether string.
  released: string;
  /// Per-milestone amounts (ether strings) paired with their released flag.
  milestones: { amount: string; released: boolean }[];
}

/// Read an escrow job by id and return a JSON-safe summary.
export async function getJob(
  agent: StoaAgent,
  escrow: `0x${string}`,
  jobId: number,
): Promise<EscrowJobSummary> {
  const [job, milestones, released] = await agent.publicClient.readContract({
    address: escrow,
    abi: stoaEscrowAbi,
    functionName: "getJob",
    args: [BigInt(jobId)],
  });

  const milestoneSummary = milestones.map((amount, index) => ({
    amount: formatEther(amount),
    released: released[index] ?? false,
  }));

  return {
    jobId,
    payer: job.payer,
    payee: job.payee,
    arbiter: job.arbiter,
    token: job.token,
    deadline: job.deadline.toString(),
    state: Number(job.state),
    total: formatEther(job.total),
    released: formatEther(job.released),
    milestones: milestoneSummary,
  };
}
