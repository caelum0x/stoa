/**
 * Example: register and resolve an agent identity in StoaRegistry.
 *
 * Prereqs: STOA_PRIVATE_KEY, STOA_REGISTRY_ADDRESS, PHAROS_RPC_URL.
 * Run:     pnpm --filter @stoa/examples identity
 */
import { StoaAgent, agentIdentityAction } from "@stoa/skills";

async function main(): Promise<void> {
  const agent = StoaAgent.fromEnv();
  console.log(`Agent ${agent.address} on chain ${agent.chain.id}`);

  const registered = await agentIdentityAction.handler(agent, {
    op: "register",
    metadataURI: "data:application/json,{\"name\":\"Example Agent\"}",
  });
  console.log("register →", registered);

  const agentId = (registered.data as { agentId?: number })?.agentId;
  if (agentId !== undefined) {
    const resolved = await agentIdentityAction.handler(agent, { op: "resolve", agentId });
    console.log("resolve →", resolved);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
