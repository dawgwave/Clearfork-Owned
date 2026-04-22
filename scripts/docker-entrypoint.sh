#!/bin/sh
set -e
cd /app

tsx_bin="/migrate/node_modules/.bin/tsx"

if [ "${RUN_MIGRATIONS:-}" = "true" ]; then
  echo "[entrypoint] RUN_MIGRATIONS=true — applying DB migrations (retries until MySQL accepts connections)..."
  i=0
  ok=0
  while [ "$i" -lt 45 ]; do
    if (cd /migrate && "$tsx_bin" scripts/migrate.ts up); then
      ok=1
      break
    fi
    i=$((i + 1))
    sleep 2
  done
  if [ "$ok" != "1" ]; then
    echo "[entrypoint] Migrations failed after $i attempts." >&2
    exit 1
  fi
  echo "[entrypoint] Migrations finished."
fi

exec node server.js
