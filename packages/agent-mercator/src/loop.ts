import {
  agentIdentityAction,
  x402MonetizeAction,
  reputationAction,
  agentEscrowAction,
  x402PayAction,
  closeMonetizedServer,
  type ActionResult,
} from "@stoa/skills";
import type { MercatorConfig } from "./config.js";
import { banner, nextStep, info, detail, success, skipped, failure } from "./log.js";

interface LoopState {
  sellerAgentId?: number;
  jobId?: number;
  monetizeUrl?: string;
  txHashes: string[];
}

function record(state: LoopState, result: ActionResult): void {
  const data = result.data as Record<string, unknown> | undefined;
  const hash = data?.txHash;
  if (typeof hash === "string") state.txHashes.push(hash);
}

/// Run the full agent-to-agent commerce loop on Pharos.
/// Each step degrades gracefully: if its on-chain/x402 prerequisite is unconfigured, it is
/// skipped with a reason rather than aborting the whole run.
export async function runCommerceLoop(cfg: MercatorConfig): Promise<void> {
  const state: LoopState = { txHashes: [] };

  banner("Mercator — Agent Commerce Loop on Pharos");
  detail("seller (Mercator)", cfg.seller.address);
  detail("buyer", cfg.buyer.address);
  detail("chain", cfg.seller.chain.id);

  // 1) Seller registers an on-chain identity.
  nextStep("Mercator registers its identity");
  if (cfg.hasRegistry) {
    const res = await agentIdentityAction.handler(cfg.seller, {
      op: "register",
      metadataURI: "data:application/json,{\"name\":\"Mercator\",\"skill\":\"market-insight\"}",
    });
    if (res.status === "success") {
      const data = res.data as { agentId?: number };
      state.sellerAgentId = data.agentId;
      record(state, res);
      success(`registered as agent #${data.agentId}`);
    } else {
      failure(res.message);
    }
  } else {
    skipped("STOA_REGISTRY_ADDRESS not set");
  }

  // 2) Seller lists a paid service behind an x402 paywall.
  nextStep("Mercator lists a paid service (x402)");
  if (cfg.facilitatorUrl) {
    const res = await x402MonetizeAction.handler(cfg.seller, {
      path: "/insight",
      price: "0.01",
      method: "GET",
      content: "MARKET INSIGHT: PROS momentum positive; suggested action BUY.",
      facilitatorUrl: cfg.facilitatorUrl,
    });
    if (res.status === "success") {
      const data = res.data as { url?: string };
      state.monetizeUrl = data.url;
      success(`service live at ${data.url} (0.01 / call)`);
    } else {
      failure(res.message);
    }
  } else {
    skipped("X402_FACILITATOR_URL not set");
  }

  // 3) Buyer discovers Mercator and checks its reputation before hiring.
  nextStep("Buyer resolves Mercator and checks reputation");
  if (cfg.hasRegistry && state.sellerAgentId !== undefined) {
    const resolved = await agentIdentityAction.handler(cfg.buyer, {
      op: "resolve",
      agentId: state.sellerAgentId,
    });
    if (resolved.status === "success") {
      const rep = (resolved.data as { reputation?: { count: number } }).reputation;
      success(`resolved Mercator — ${rep?.count ?? 0} prior attestations`);
    } else {
      failure(resolved.message);
    }
  } else {
    skipped("registry not configured or Mercator not registered");
  }

  // 4) Buyer hires Mercator via milestone escrow.
  nextStep("Buyer hires Mercator via milestone escrow");
  if (cfg.hasEscrow) {
    const res = await agentEscrowAction.handler(cfg.buyer, {
      op: "create",
      payee: cfg.seller.address,
      token: "native",
      milestones: ["0.001"],
    });
    if (res.status === "success") {
      const data = res.data as { jobId?: number };
      state.jobId = data.jobId;
      record(state, res);
      success(`escrow job #${data.jobId} funded with 0.001 PHRS`);
    } else {
      failure(res.message);
    }
  } else {
    skipped("STOA_ESCROW_ADDRESS not set");
  }

  // 5) To fulfill the job, Mercator subcontracts — paying another endpoint via x402.
  nextStep("Mercator subcontracts data (agent pays agent, x402)");
  const subUrl = cfg.subcontractUrl ?? state.monetizeUrl;
  if (subUrl && cfg.facilitatorUrl) {
    const res = await x402PayAction.handler(cfg.seller, { url: subUrl, method: "GET", maxPrice: "0.05" });
    if (res.status === "success") {
      success(`paid subcontractor and received data (${subUrl})`);
    } else {
      failure(res.message);
    }
  } else {
    skipped("no subcontract URL / facilitator available");
  }

  // 6) On delivery, the buyer releases the milestone.
  nextStep("Buyer releases the milestone on delivery");
  if (cfg.hasEscrow && state.jobId !== undefined) {
    const res = await agentEscrowAction.handler(cfg.buyer, { op: "release", jobId: state.jobId, index: 0 });
    if (res.status === "success") {
      record(state, res);
      success("milestone released to Mercator");
    } else {
      failure(res.message);
    }
  } else {
    skipped("no escrow job to release");
  }

  // 7) Buyer leaves an on-chain reputation attestation.
  nextStep("Buyer attests Mercator's reputation");
  if (cfg.hasRegistry && state.sellerAgentId !== undefined) {
    const res = await reputationAction.handler(cfg.buyer, {
      op: "attest",
      agentId: state.sellerAgentId,
      score: 5,
      uri: state.jobId !== undefined ? `stoa:job/${state.jobId}` : undefined,
    });
    if (res.status === "success") {
      record(state, res);
      success("5★ attestation recorded on-chain");
    } else {
      failure(res.message);
    }
  } else {
    skipped("registry not configured or Mercator not registered");
  }

  // Cleanup any monetized server we started.
  if (state.monetizeUrl) await closeMonetizedServer(state.monetizeUrl);

  banner("Loop complete");
  info(`${state.txHashes.length} on-chain transactions sent this run`);
  for (const h of state.txHashes) detail("tx", h);
}
