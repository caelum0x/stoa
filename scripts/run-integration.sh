#!/usr/bin/env bash
# End-to-end integration: anvil + Stoa contracts + on-chain skills.
set -euo pipefail
cd "$(dirname "$0")/.."

SOLC="$(command -v solc || echo /opt/homebrew/bin/solc)"

echo "==> Building contracts (offline solc: $SOLC)"
forge build --root packages/contracts --use "$SOLC" >/dev/null

echo "==> Starting anvil"
anvil --silent &
ANVIL_PID=$!
trap 'kill "$ANVIL_PID" 2>/dev/null || true' EXIT

# Wait for the RPC to accept connections.
for _ in $(seq 1 30); do
  if curl -s -X POST http://127.0.0.1:8545 \
      -H 'content-type: application/json' \
      --data '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' >/dev/null 2>&1; then
    break
  fi
  sleep 0.3
done

echo "==> Running integration skills"
( cd packages/skills && ./node_modules/.bin/tsx scripts/integration.ts )
