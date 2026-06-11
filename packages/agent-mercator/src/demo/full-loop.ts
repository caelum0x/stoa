// Mercator full-loop demo: seller selection (planner) → on-chain commerce loop → trace.
//
// Demonstrates that Mercator is a commerce orchestrator: it scores candidate sellers, runs the
// real discover→trust→hire→pay→settle→rate loop (the same skills external devs use), and emits a
// structured trace of what happened.
import { loadConfig } from "../config.js";
import { runCommerceLoop } from "../loop.js";
import { TraceWriter } from "../trace.js";
import { pickBestSeller, type SellerCandidate } from "../planner.js";
import { defaultScenario } from "../scenario.js";

export async function runFullLoop(): Promise<void> {
  const trace = new TraceWriter("mercator-full-loop");

  // 1) Planner: pick the best seller for the scenario from candidate signals.
  const candidates: SellerCandidate[] = [
    { agentId: 1, reputation: 4.8, priceFit: 0.9, successfulJobs: 12, responseTime: 0.7 },
    { agentId: 2, reputation: 4.2, priceFit: 0.8, successfulJobs: 5, responseTime: 0.6 },
  ];
  const best = pickBestSeller(candidates);
  trace.record({
    skill: "planner",
    result: `selected agent #${best?.agentId ?? "none"} for "${defaultScenario.capability}" (budget ${defaultScenario.maxPricePhrs} PHRS)`,
  });

  // 2) Run the real on-chain commerce loop (degrades gracefully if infra is unconfigured).
  const cfg = loadConfig();
  await runCommerceLoop(cfg);
  trace.record({ skill: "commerce_loop", result: "completed" });

  // 3) Emit the structured trace.
  console.log(JSON.stringify(trace.toJSON(), null, 2));
}

const isEntry =
  typeof process !== "undefined" &&
  process.argv[1] !== undefined &&
  import.meta.url === `file://${process.argv[1]}`;

if (isEntry) {
  runFullLoop().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
