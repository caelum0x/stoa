/**
 * Example: discover services by capability in the Stoa marketplace (StoaServices).
 *
 * A buyer agent browses for sellers advertising a given capability before hiring.
 *
 * Prereqs: STOA_PRIVATE_KEY, STOA_SERVICES_ADDRESS, PHAROS_RPC_URL.
 * Run:     pnpm --filter @stoa/examples exec tsx src/06-discover-service.ts
 */
import { StoaClient } from "@stoa/sdk";

async function main(): Promise<void> {
  const client = StoaClient.fromEnv();
  const capability = process.env.STOA_CAPABILITY ?? "research";
  console.log(`Buyer ${client.address} discovering "${capability}" services…`);

  const found = await client.discoverServices(capability);

  console.log("discoverServices →", {
    capability,
    count: found.serviceIds.length,
    serviceIds: found.serviceIds.join(", "),
  });
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
