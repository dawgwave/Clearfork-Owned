#!/usr/bin/env bash
# Control the optional staging app on a docker-compose droplet (not started by default).
# Run on the server: cd /opt/clearfork-insurance && ./staging on
# Or from dev: ssh user@host 'bash -s' < scripts/staging.sh -- on
set -euo pipefail

if [[ "${1:-}" == "--" ]]; then shift; fi
ACTION="${1:-}"
CLEARFORK_DIR="${CLEARFORK_DIR:-/opt/clearfork-insurance}"

if docker compose version &>/dev/null; then
  DC=(docker compose)
else
  DC=(docker-compose)
fi
STG=(--profile staging)

cd "$CLEARFORK_DIR" || { echo "Cannot cd to $CLEARFORK_DIR" >&2; exit 1; }

usage() {
  echo "Usage: $0 {on|off|status|logs|restart-caddy|doctor}" >&2
  echo "  on             Start staging container (profile: staging). Prod stays up." >&2
  echo "  off            Stop staging only." >&2
  echo "  status         ps for staging (and caddy 3001 hint)." >&2
  echo "  logs           tail staging logs" >&2
  echo "  restart-caddy  Reload caddy after editing Caddyfile" >&2
  echo "  doctor         Quick checks for http://127.0.0.1:3001 via SSH -L tunnel" >&2
  echo "CLEARFORK_DIR=$CLEARFORK_DIR" >&2
  exit 1
}

case "$ACTION" in
  on)
    if [[ ! -f .env.staging ]]; then
      echo "Missing .env.staging in $CLEARFORK_DIR. Copy staging.env.example to .env.staging and edit (see deploy/ in repo)." >&2
      exit 1
    fi
    "${DC[@]}" "${STG[@]}" up -d clearfork-app-staging
    echo "Staging app up. Use http:// (not https) via tunnel: http://127.0.0.1:3001/ — Caddy -> clearfork-app-staging:8081."
    ;;
  off)
    if "${DC[@]}" "${STG[@]}" stop clearfork-app-staging 2>/dev/null; then
      echo "Staging stopped."
    else
      echo "Nothing to stop (staging not running or never created?)."
    fi
    ;;
  status)
    "${DC[@]}" ps -a 2>/dev/null | head -25 || true
    echo "---"
    "${DC[@]}" "${STG[@]}" ps -a clearfork-app-staging 2>/dev/null || true
    (ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null) | grep -E ':3001\b' || echo "Port 3001 (Caddy staging): check ss."
    ;;
  logs)
    "${DC[@]}" "${STG[@]}" logs -f --tail=100 clearfork-app-staging
    ;;
  restart-caddy)
    "${DC[@]}" restart caddy
    ;;
  doctor)
    echo "=== Staging / :3001 checks (run on the droplet) ==="
    if ! "${DC[@]}" "${STG[@]}" ps -a clearfork-app-staging 2>/dev/null | grep -q 'Up'; then
      echo "[!] clearfork-app-staging is NOT running. Port 3001 will 502 from Caddy. Run: $0 on"
    else
      echo "[OK] clearfork-app-staging is Up"
    fi
    if ! "${DC[@]}" ps -a caddy 2>/dev/null | grep -q 'Up'; then
      echo "[!] caddy is NOT running."
    else
      echo "[OK] caddy is Up"
    fi
    (ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null) | grep -E ':3001\b' || echo "[!] Nothing listening on host :3001 (Caddy should bind 0.0.0.0:3001)"
    echo "--- Last staging logs (migrate + server) ---"
    "${DC[@]}" "${STG[@]}" logs --tail=40 clearfork-app-staging 2>/dev/null || true
    echo "---"
    echo "Local tunnel (run on your laptop): ssh -N -L 3001:127.0.0.1:3001 root@YOUR_DROPLET_IP"
    echo "Then open: http://127.0.0.1:3001/  (HTTP only)"
    echo "If you get 403 Forbidden, Caddy blocked remote_ip; use the tunnel above or set CADDY_STAGING_IP in compose to your public IP."
    ;;
  ""|-h|--help) usage ;;
  *) echo "Unknown action: $ACTION" >&2; usage ;;
esac
