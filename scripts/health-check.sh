#!/bin/bash

# Health Check Script for Clearfork Insurance
# Usage: ./scripts/health-check.sh [droplet-ip]

DROPLET_IP="${1:-}"
DROPLET_USER="root"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Helper functions
pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }

# Get droplet IP if not provided
if [[ -z "$DROPLET_IP" ]]; then
    echo -n "Enter your droplet IP: "
    read -r DROPLET_IP
fi

echo "🔍 Running health checks for $DROPLET_IP..."
echo ""

# Test SSH connectivity
echo "📡 SSH Connectivity"
if ssh -o ConnectTimeout=5 "$DROPLET_USER@$DROPLET_IP" "echo 'Connected'" >/dev/null 2>&1; then
    pass "SSH connection successful"
else
    fail "Cannot connect via SSH"
    exit 1
fi

# Check if app is running
echo ""
echo "🚀 Application Status"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$DROPLET_IP/" --connect-timeout 10 || echo "000")

if [[ "$HTTP_STATUS" == "200" ]]; then
    pass "Application responding on port 80 (Caddy → app)"
elif [[ "$HTTP_STATUS" == "000" ]]; then
    fail "Cannot connect to application (connection refused)"
else
    warn "Application returned HTTP $HTTP_STATUS"
fi

# Check specific pages
echo ""
echo "📄 Page Health Checks"
pages=("/" "/blog" "/get-a-quote" "/login")
for page in "${pages[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://$DROPLET_IP$page" --connect-timeout 5 || echo "000")
    if [[ "$status" == "200" ]]; then
        pass "$page - OK"
    else
        fail "$page - HTTP $status"
    fi
done

# Check remote services
echo ""
echo "🔧 Remote System Status"
ssh "$DROPLET_USER@$DROPLET_IP" '
echo "💾 Disk Usage:"
df -h / | tail -1

echo ""
echo "🧠 Memory Usage:"
free -h

echo ""
echo "⚡ System Load:"
uptime

echo ""
echo "🐳 Docker Status (if running):"
if command -v docker >/dev/null 2>&1; then
    docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(clearfork|mysql)" || echo "No containers running"
else
    echo "Docker not installed"
fi

echo ""
echo "📊 PM2 Status (if running):"
if command -v pm2 >/dev/null 2>&1; then
    pm2 list | grep -E "(clearfork|online|stopped)" || echo "No PM2 processes"
else
    echo "PM2 not installed"
fi

echo ""
echo "🔗 Network Ports:"
(ss -tlnp 2>/dev/null || netstat -tlnp) | grep -E ":80|:443|:8080|:3306" | head -8 || echo "No services on common ports"
'

# App reachable on loopback (Caddy on :80)
echo ""
echo "🗄️  App / API loopback"
LOOP_STATUS=$(ssh "$DROPLET_USER@$DROPLET_IP" "
    curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/api/auth/me --connect-timeout 5 || echo '000'
")

if [[ "$LOOP_STATUS" == "401" ]] || [[ "$LOOP_STATUS" == "200" ]]; then
    pass "API reachable via Caddy (GET /api/auth/me → $LOOP_STATUS)"
elif [[ "$LOOP_STATUS" == "000" ]]; then
    fail "Cannot reach app on localhost:80"
else
    warn "GET /api/auth/me returned HTTP $LOOP_STATUS (expected 401 without cookie)"
fi

echo ""
echo "🏁 Health check completed for $DROPLET_IP"