# @stoa/skills

Composable, Pharos Agent Kit-compatible commerce skills for AI agents.

## Install

```bash
pnpm add @stoa/skills viem zod
# optional, for the payment skills:
pnpm add @x402/fetch @x402/evm @x402/core @x402/express express
```

## The Action interface

Every skill is an `Action`, matching the Pharos Agent Kit shape so it drops in natively:

```ts
interface Action<TSchema extends z.ZodTypeAny> {
  name: string;          // "X402_PAY"
  similes: string[];     // ["pay for api", ...]
  description: string;
  examples: ActionExample[];
  schema: TSchema;       // Zod schema (input validation + docs)
  handler: (agent: StoaAgent, input: z.infer<TSchema>) => Promise<ActionResult>;
}

interface ActionResult<T> { status: "success" | "error"; data?: T; message: string; }
```

`StoaAgent` is structurally compatible with `PharosAgentKit` — it exposes the same viem
`account`, `publicClient`, and `walletClient`, so a kit instance and a `StoaAgent` are
interchangeable in handlers.

## The six skills

### `x402_pay` — buy any paid resource
Pays an x402-protected endpoint and returns the content. Inspects the 402 quote first and
aborts if it exceeds `maxPrice`.
```ts
await x402PayAction.handler(agent, { url: "https://api.x/insight", maxPrice: "0.05" });
```

### `x402_monetize` — become a seller
Stands up an x402-paywalled endpoint that settles to the agent's address.
```ts
await x402MonetizeAction.handler(agent, { path: "/insight", price: "0.01", content: "..." });
```

### `agent_identity` — identity in StoaRegistry
```ts
await agentIdentityAction.handler(agent, { op: "register", metadataURI: "ipfs://..." });
await agentIdentityAction.handler(agent, { op: "resolve",  agentId: 7 });
```

### `reputation` — attest & read
```ts
await reputationAction.handler(agent, { op: "attest", agentId: 7, score: 5, uri: "ipfs://receipt" });
await reputationAction.handler(agent, { op: "score",  agentId: 7 });
```

### `agent_escrow` — milestone settlement
```ts
await agentEscrowAction.handler(agent, { op: "create", payee: "0x..", milestones: ["1", "2"] });
await agentEscrowAction.handler(agent, { op: "release", jobId: 3, index: 0 });
```

### `treasury_guard` — safe spending
```ts
await treasuryGuardAction.handler(agent, {
  to: "0x..", amount: "0.5", token: "native", maxPerTx: "1", dailyCap: "10",
});
```

## Adapters

```ts
import { createLangchainTools } from "@stoa/skills/langchain";
import { createVercelTools }    from "@stoa/skills/vercel-ai";
import { createStoaMcpServer }  from "@stoa/skills/mcp";

const tools = createLangchainTools(agent);        // LangChain DynamicStructuredTool[]
const aiTools = createVercelTools(agent);          // Vercel AI SDK tool set
const server = createStoaMcpServer(agent);         // MCP server (all six skills)
```

Run the MCP server standalone (stdio):
```bash
STOA_PRIVATE_KEY=0x... STOA_REGISTRY_ADDRESS=0x... pnpm --filter @stoa/skills mcp
```

## Configuration

`StoaAgent.fromEnv()` reads:

| Env | Purpose |
|-----|---------|
| `STOA_PRIVATE_KEY` | agent signer (testnet) |
| `PHAROS_RPC_URL` | RPC (defaults to Atlantic public RPC) |
| `STOA_CHAIN_ID` | chain id (defaults to 688689) |
| `STOA_REGISTRY_ADDRESS` | deployed StoaRegistry |
| `STOA_ESCROW_ADDRESS` | deployed StoaEscrow |
| `X402_FACILITATOR_URL` | x402 facilitator (for `x402_monetize`) |
| `STOA_GUARD_ALLOWLIST` / `STOA_GUARD_MAX_PER_TX` / `STOA_GUARD_DAILY_CAP` | default treasury policy |

## Test

```bash
pnpm --filter @stoa/skills test
```
