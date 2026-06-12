#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/apps/web/.env.local"

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI is not installed. Install it with: pnpm dlx vercel --version" >&2
  exit 1
fi

if ! vercel whoami >/dev/null 2>&1; then
  if [[ -z "${VERCEL_TOKEN:-}" ]]; then
    echo "Vercel is not authenticated. Run 'vercel login' or set VERCEL_TOKEN." >&2
    exit 1
  fi
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "$ENV_FILE not found. Run pnpm deploy:live first." >&2
  exit 1
fi

sync_env() {
  local key="$1"
  local value
  value="$(grep -E "^${key}=" "$ENV_FILE" | head -n1 | cut -d= -f2- || true)"
  if [[ -z "$value" ]]; then
    return
  fi
  printf '%s' "$value" | vercel env add "$key" production --force >/dev/null
}

while IFS='=' read -r key _; do
  [[ -z "$key" || "$key" == \#* ]] && continue
  case "$key" in
    PHAROS_RPC_URL|STOA_*_ADDRESS|NEXT_PUBLIC_STOA_*_ADDRESS|X402_PAY_TO)
      sync_env "$key"
      ;;
  esac
done < "$ENV_FILE"

vercel deploy "$ROOT" --prod --yes
