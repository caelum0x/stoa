/**
 * Example: a tiny seller API exposing GET /summary as JSON.
 *
 * This is the kind of endpoint a seller would advertise via listService(). Real monetization is
 * handled by the x402_monetize skill (see @stoa/skills x402MonetizeAction), which wraps a handler
 * with HTTP 402 payment enforcement; this bare server just demonstrates the response shape.
 *
 * Express is imported dynamically so the example package does not hard-depend on it.
 * Run:     pnpm --filter @stoa/examples exec tsx src/servers/x402-seller-api.ts
 */
async function main(): Promise<void> {
  let express: typeof import("express")["default"];
  try {
    ({ default: express } = await import("express"));
  } catch {
    console.error("express is not installed. Install it to run this demo: pnpm add express");
    process.exit(1);
    return;
  }

  const app = express();
  const port = Number(process.env.PORT ?? "4021");

  app.get("/summary", (_req, res) => {
    res.json({
      capability: "research",
      summary: "Stoa is an on-chain agent-commerce stack for the Pharos network.",
      note: "Real monetization is enforced by the x402_monetize skill (HTTP 402).",
      generatedAt: new Date().toISOString(),
    });
  });

  app.listen(port, () => console.log(`x402 seller API listening on http://localhost:${port}/summary`));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
