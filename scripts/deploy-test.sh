#!/bin/bash
# Deploy the current branch to the droplet IP you pass (default below).
# WARNING: Same Compose project as production when prod and test share one host — deploy.sh runs
# `docker compose down` + `up` for the ENTIRE stack (MySQL, prod app, Caddy). That restarts production too.
# Sets CLEARFORK_DEPLOY_STAGING=1: skips main-branch guard and runs ./staging on after up (Caddy :3001).
# Production-only updates: merge to main and use ./scripts/deploy.sh (same stack, same caution).
# Usage: ./scripts/deploy-test.sh [docker|direct] [droplet-ip]
# Default: docker to 67.205.157.124

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
export CLEARFORK_DEPLOY_STAGING=1

DEPLOY_TYPE="${1:-docker}"
TEST_DROPLET_IP="${2:-67.205.157.124}"

BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'
log() { echo -e "${BLUE}[INFO]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

if ! git -C "$REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    err "Not a git repository."
    exit 1
fi
BR=$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD)
log "Test/staging: branch $BR -> $TEST_DROPLET_IP ($DEPLOY_TYPE)"
log "Production: merge to ${CLEARFORK_PRODUCTION_BRANCH:-main} and run ./scripts/deploy.sh"

exec "$SCRIPT_DIR/deploy.sh" "$DEPLOY_TYPE" "$TEST_DROPLET_IP"
