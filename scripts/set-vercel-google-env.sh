#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

if ! command -v vercel >/dev/null 2>&1; then
  echo "Install Vercel CLI: npm i -g vercel"
  exit 1
fi

if ! vercel whoami >/dev/null 2>&1; then
  echo "Not logged in. Run: vercel login"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

read_env() {
  local key="$1"
  local line value
  line="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 || true)"
  if [[ -z "$line" ]]; then
    echo "Missing $key in $ENV_FILE" >&2
    return 1
  fi
  value="${line#*=}"
  if [[ "$value" == \"*\" && "$value" == *\" ]]; then
    value="${value:1:${#value}-2}"
  fi
  printf '%s' "$value"
}

add_env() {
  local name="$1"
  local value="$2"
  local env

  if [[ -z "$value" ]]; then
    echo "Refusing to set empty value for $name" >&2
    exit 1
  fi

  for env in production preview development; do
    vercel env rm "$name" "$env" -y 2>/dev/null || true
    printf '%s' "$value" | vercel env add "$name" "$env" --yes
  done
  echo "Set $name for production, preview, and development"
}

cd "$ROOT"

EMAIL="$(read_env GOOGLE_SERVICE_ACCOUNT_EMAIL)" || exit 1
PRIVATE_KEY="$(read_env GOOGLE_PRIVATE_KEY)" || exit 1
SHEET_ID="$(read_env GOOGLE_SHEET_ID)" || exit 1

if [[ "$PRIVATE_KEY" != *"BEGIN PRIVATE KEY"* ]]; then
  echo "GOOGLE_PRIVATE_KEY in $ENV_FILE is not a valid PEM key." >&2
  exit 1
fi

if [[ ! -f .vercel/project.json ]]; then
  echo "Linking Vercel project (will not modify .env.local)..."
  vercel link --yes
fi

add_env "GOOGLE_SERVICE_ACCOUNT_EMAIL" "$EMAIL"
add_env "GOOGLE_PRIVATE_KEY" "$PRIVATE_KEY"
add_env "GOOGLE_SHEET_ID" "$SHEET_ID"

echo "Done. Redeploy with: vercel --prod"
