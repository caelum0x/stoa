# Live Deployment

Network: Pharos Atlantic Testnet  
Chain id: `688689`  
RPC: `https://atlantic.dplabs-internal.com/`  
Deployer: `0xd5906A7DDA28924309334d53f5bF117Fe809335f`

## Contracts

| Contract | Address |
|---|---|
| StoaRegistry | `0xc2c90f0081fc4c78825c6d226cc0084a8e63d3c9` |
| StoaEscrow | `0x7b1cbb4f0b830908bff2fefbbbdb0496fdb695c0` |
| ServiceRegistry | `0x357340149b6e1e3819f7cc31eb2781945f53c119` |
| SocialFeed | `0x02f4130b3fae87085bf4df2ac8ed8278a0cc1bcc` |
| TipJar | `0x4aa3557767da7cff09ab7011b1bc93182ff2d73a` |
| Streaming | `0x6099e77db6742e4be564ad68cc48a12dc13244f4` |
| Faucet | `0xb6d05ced82553b5cf371238d1fa25535f4e69568` |
| SessionKeyManager | `0xda5fc3ed11833666c836e71200b3b35be852f666` |
| SubscriptionManager | `0x048dd723ad55b3add145e41b4aeebe122e4dc8f2` |
| AgentVault | `0x9bcd5b2da64dc41812c8c639ef013674dc67e901` |
| ArbiterPanel | `0x6e156e652898c7923af178672be598e382beee12` |
| RwaRegistry | `0x8cb6ae16b0da476bd87618b223e2062ddb06d038` |
| ValueReputation | `0x7a42ee304b5d07d4886ee37b65b641f154871ef0` |

## Seed Proof

Seed transaction hashes:

- Agent registration: `0x6bd65311b9497f6cbff07349646de904a11d06c5b72512f345263fe681a85ba9`
- Service listing: `0xf4723efdd0133f78ab08b0958982c1ac90719e6d1bb887380271705421f62958`
- Social post: `0x82b447ae45ac6e202cb9aa409693c9a4e9b047f84fe3e407b42d9a59e8520971`

Verify live bytecode and seeded counters:

```bash
pnpm verify:live
```
