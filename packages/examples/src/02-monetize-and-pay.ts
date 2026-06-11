/**
 * Example: a seller agent monetizes an endpoint; a buyer agent pays it via x402.
 * Demonstrates the agent-pays-agent micropayment cascade end-to-end.
 *
 * Prereqs: MERCATOR_SELLER_KEY, MERCATOR_BUYER_KEY, X402_FACILITATOR_URL, PHAROS_RPC_URL.
 *          Requires the optional @x402/* packages + express to be installed.
 * Run:     pnpm --filter @stoa/examples monetize
 */
import { StoaAgent, x402MonetizeAction, x402PayAction, closeMonetizedServer } from "@stoa/skills";

async function main(): Promise<void> {
  const facilitatorUrl = process.env.X402_FACILITATOR_URL;
  if (!facilitatorUrl) throw new Error("X402_FACILITATOR_URL is required for this example.");

  const seller = new StoaAgent({
    privateKey: process.env.MERCATOR_SELLER_KEY as `0x${string}`,
    rpcUrl: process.env.PHAROS_RPC_URL,
  });
  const buyer = new StoaAgent({
    privateKey: process.env.MERCATOR_BUYER_KEY as `0x${string}`,
    rpcUrl: process.env.PHAROS_RPC_URL,
  });

  const listing = await x402MonetizeAction.handler(seller, {
    path: "/insight",
    price: "0.01",
    content: "alpha: accumulate on weakness",
    facilitatorUrl,
  });
  console.log("monetize →", listing);

  const url = (listing.data as { url?: string })?.url;
  if (!url) return;

  try {
    const purchase = await x402PayAction.handler(buyer, { url, maxPrice: "0.05" });
    console.log("pay →", purchase);
  } finally {
    await closeMonetizedServer(url);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
