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
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$DROPLET_IP:3000" --connect-timeout 10 || echo "000")

if [[ "$HTTP_STATUS" == "200" ]]; then
    pass "Application responding on port 3000"
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
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://$DROPLET_IP:3000$page" --connect-timeout 5 || echo "000")
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
netstat -tlnp | grep ":3000\|:3306\|:80\|:443" | head -5 || echo "No services on common ports"
'

# Database connectivity test
echo ""
echo "🗄️  Database Health"
DB_TEST=$(ssh "$DROPLET_USER@$DROPLET_IP" "
    curl -s -X POST http://localhost:3000/api/auth/me \
    -H 'Content-Type: application/json' \
    --connect-timeout 5 || echo 'DB_ERROR'
")

if [[ "$DB_TEST" != "DB_ERROR" ]]; then
    pass "Database connectivity OK"
else
    fail "Database connection issues"
fi

echo ""
echo "🏁 Health check completed for $DROPLET_IP"