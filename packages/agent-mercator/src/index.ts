import { loadConfig } from "./config.js";
import { runCommerceLoop } from "./loop.js";
import { failure } from "./log.js";

async function main(): Promise<void> {
  const cfg = loadConfig();
  await runCommerceLoop(cfg);
}

main().catch((err) => {
  failure(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
