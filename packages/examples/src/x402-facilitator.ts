/**
 * A minimal local x402 facilitator for Pharos Atlantic.
 *
 * The facilitator verifies and settles x402 payments on-chain. Run this so the
 * `x402_monetize` / `x402_pay` skills work fully locally for demos/video.
 *
 * Prereqs: STOA_PRIVATE_KEY (a funded testnet key used to settle), PHAROS_RPC_URL.
 *          Requires the optional @x402/* packages + express to be installed.
 * Run:     X402_PORT=4022 tsx src/x402-facilitator.ts
 *
 * Then point sellers/buyers at:  X402_FACILITATOR_URL=http://localhost:4022
 */
import { privateKeyToAccount } from "viem/accounts";

const PORT = Number(process.env.X402_PORT ?? 4022);
const NETWORK = `eip155:${process.env.STOA_CHAIN_ID ?? 688689}`;

async function main(): Promise<void> {
  const pk = process.env.STOA_PRIVATE_KEY;
  if (!pk) throw new Error("STOA_PRIVATE_KEY is required to run the facilitator.");

  // Dynamic imports so this file builds without the optional deps installed.
  const load = async (name: string) => {
    try {
      return await import(name);
    } catch {
      throw new Error(`Missing optional dependency "${name}". Install: pnpm add ${name}`);
    }
  };

  const express = (await load("express")).default;
  const { x402Facilitator } = await load("@x402/core/facilitator");
  const { ExactEvmScheme } = await load("@x402/evm/exact/facilitator");

  const signer = privateKeyToAccount(pk as `0x${string}`);
  const facilitator = new x402Facilitator();
  facilitator.register(NETWORK, new ExactEvmScheme(signer));

  const app = express();
  app.use(express.json());

  app.post("/verify", async (req: any, res: any) => {
    const { paymentPayload, paymentRequirements } = req.body;
    const result = await facilitator.verify(paymentPayload, paymentRequirements);
    res.json(result);
  });

  app.post("/settle", async (req: any, res: any) => {
    const { paymentPayload, paymentRequirements } = req.body;
    const result = await facilitator.settle(paymentPayload, paymentRequirements);
    res.json(result);
  });

  app.get("/health", (_req: any, res: any) => res.json({ ok: true, network: NETWORK }));

  app.listen(PORT, () => {
    console.log(`x402 facilitator on http://localhost:${PORT} (network ${NETWORK}, settler ${signer.address})`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
