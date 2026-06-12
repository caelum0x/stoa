import { z } from "zod";
import { parseUnits, formatUnits, zeroAddress, parseEventLogs, type Address } from "viem";
import { type Action, ok, fail, errorMessage } from "../types.js";
import { stoaEscrowAbi, ESCROW_STATE } from "../abi/stoaEscrow.js";
import { erc20Abi } from "../abi/erc20.js";
import { addressSchema, tokenSchema, decimalAmountSchema } from "../schemas.js";

export const agentEscrowSchema = z.object({
  op: z.enum(["create", "release", "refund", "get"]).describe("Escrow operation."),
  // create
  payee: addressSchema.optional().describe("Worker agent address (create)."),
  arbiter: addressSchema.optional().describe("Optional neutral arbiter (create)."),
  token: tokenSchema.optional().describe('Payment token or "native" (create). Defaults to native PHRS.'),
  deadline: z.coerce.number().int().nonnegative().optional().describe("Unix deadline, 0 = none."),
  milestones: z
    .array(decimalAmountSchema)
    .min(1)
    .optional()
    .describe("Per-milestone amounts in human units (create)."),
  // release / refund / get
  jobId: z.coerce.number().int().positive().optional().describe("Job id (release/refund/get)."),
  index: z.coerce.number().int().nonnegative().optional().describe("Milestone index (release)."),
});

async function resolveDecimals(
  agent: Parameters<Action["handler"]>[0],
  token: Address,
): Promise<number> {
  if (token === zeroAddress) return 18;
  const decimals = await agent.publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "decimals",
  });
  return Number(decimals);
}

/// SKILL: agent_escrow
/// Creates, releases, refunds, and reads milestone escrow jobs for agent-to-agent work on Pharos.
export const agentEscrowAction: Action<typeof agentEscrowSchema> = {
  name: "AGENT_ESCROW",
  similes: ["escrow", "milestone payment", "hire agent", "release milestone", "refund job"],
  description:
    "Manage milestone escrow on Pharos: lock funds for a job, release milestones to the worker, " +
    "refund the remainder, or read job state. Supports native PHRS and ERC-20.",
  examples: [
    {
      input: { op: "create", payee: "0xWorker", token: "native", milestones: ["1", "2"] },
      output: ok("Escrow job created", { jobId: 3, txHash: "0x..." }),
      explanation: "Locks 3 PHRS across two milestones for a worker agent.",
    },
    {
      input: { op: "release", jobId: 3, index: 0 },
      output: ok("Milestone released", { txHash: "0x..." }),
      explanation: "Pays out the first milestone.",
    },
  ],
  schema: agentEscrowSchema,
  handler: async (agent, input) => {
    try {
      const escrow = agent.requireContract("escrow");

      if (input.op === "create") {
        if (!input.payee || !input.milestones?.length) {
          return fail("payee and milestones are required to create a job.");
        }
        const tokenInput = input.token ?? "native";
        const token: Address = tokenInput === "native" ? zeroAddress : tokenInput;
        const decimals = await resolveDecimals(agent, token);
        const amounts = input.milestones.map((m) => parseUnits(m, decimals));
        const total = amounts.reduce((a, b) => a + b, 0n);

        // ERC-20 requires an allowance before the escrow can pull funds.
        if (token !== zeroAddress) {
          const approveHash = await agent.walletClient.writeContract({
            address: token,
            abi: erc20Abi,
            functionName: "approve",
            args: [escrow, total],
          });
          await agent.publicClient.waitForTransactionReceipt({ hash: approveHash });
        }

        const hash = await agent.walletClient.writeContract({
          address: escrow,
          abi: stoaEscrowAbi,
          functionName: "createJob",
          args: [
            input.payee,
            input.arbiter ?? zeroAddress,
            token,
            BigInt(input.deadline ?? 0),
            amounts,
          ],
          value: token === zeroAddress ? total : 0n,
        });
        const receipt = await agent.publicClient.waitForTransactionReceipt({ hash });
        const events = parseEventLogs({ abi: stoaEscrowAbi, logs: receipt.logs, eventName: "JobCreated" });
        const jobId = events[0]?.args.jobId;
        return ok("Escrow job created", {
          jobId: jobId !== undefined ? Number(jobId) : undefined,
          total: formatUnits(total, decimals),
          token: tokenInput,
          txHash: hash,
        });
      }

      if (input.op === "release") {
        if (input.jobId === undefined || input.index === undefined) {
          return fail("jobId and index are required to release.");
        }
        const hash = await agent.walletClient.writeContract({
          address: escrow,
          abi: stoaEscrowAbi,
          functionName: "release",
          args: [BigInt(input.jobId), BigInt(input.index)],
        });
        await agent.publicClient.waitForTransactionReceipt({ hash });
        return ok("Milestone released", { jobId: input.jobId, index: input.index, txHash: hash });
      }

      if (input.op === "refund") {
        if (input.jobId === undefined) return fail("jobId is required to refund.");
        const hash = await agent.walletClient.writeContract({
          address: escrow,
          abi: stoaEscrowAbi,
          functionName: "refund",
          args: [BigInt(input.jobId)],
        });
        await agent.publicClient.waitForTransactionReceipt({ hash });
        return ok("Job refunded", { jobId: input.jobId, txHash: hash });
      }

      // get
      if (input.jobId === undefined) return fail("jobId is required to get.");
      const [job, milestones, released] = await agent.publicClient.readContract({
        address: escrow,
        abi: stoaEscrowAbi,
        functionName: "getJob",
        args: [BigInt(input.jobId)],
      });
      const decimals = await resolveDecimals(agent, job.token);
      return ok("Job read", {
        jobId: input.jobId,
        payer: job.payer,
        payee: job.payee,
        arbiter: job.arbiter,
        token: job.token === zeroAddress ? "native" : job.token,
        state: ESCROW_STATE[job.state] ?? "Unknown",
        total: formatUnits(job.total, decimals),
        released: formatUnits(job.released, decimals),
        milestones: milestones.map((m, i) => ({
          index: i,
          amount: formatUnits(m, decimals),
          released: released[i] ?? false,
        })),
      });
    } catch (e) {
      return fail(`agent_escrow failed: ${errorMessage(e)}`);
    }
  },
};
