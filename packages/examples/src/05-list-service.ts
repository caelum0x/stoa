/**
 * Example: list a paid service in the Stoa marketplace (StoaServices).
 *
 * A seller agent advertises a capability + x402 endpoint at a price so buyers can discover it.
 *
 * Prereqs: STOA_PRIVATE_KEY, STOA_SERVICES_ADDRESS, PHAROS_RPC_URL.
 * Run:     pnpm --filter @stoa/examples exec tsx src/05-list-service.ts
 */
import { StoaClient } from "@stoa/sdk";

async function main(): Promise<void> {
  const client = StoaClient.fromEnv();
  console.log(`Seller ${client.address} listing a service…`);

  const listing = await client.listService({
    capability: process.env.STOA_CAPABILITY ?? "research",
    endpoint: process.env.STOA_ENDPOINT ?? "https://atlas.example/x402/summary",
    price: process.env.STOA_PRICE ?? "0.01",
  });

  console.log("listService →", { serviceId: listing.serviceId, txHash: listing.txHash });
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
