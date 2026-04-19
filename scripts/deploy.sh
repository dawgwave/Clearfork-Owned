#!/bin/bash

# Clearfork Insurance Deployment Script
# Usage: ./scripts/deploy.sh [docker|direct] [droplet-ip]

set -e  # Exit on any error

# Configuration
DROPLET_USER="root"  # Change if you use a different user
DROPLET_IP="${2:-}"  # Second argument or prompt
DEPLOY_TYPE="${1:-docker}"  # First argument or default to docker
APP_NAME="clearfork-insurance"
REMOTE_DIR="/opt/$APP_NAME"
DOCKER_IMAGE="$APP_NAME:latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Get droplet IP if not provided
if [[ -z "$DROPLET_IP" ]]; then
    echo -n "Enter your DigitalOcean droplet IP: "
    read -r DROPLET_IP
    [[ -z "$DROPLET_IP" ]] && error "Droplet IP is required"
fi

# Validate deployment type
if [[ "$DEPLOY_TYPE" != "docker" && "$DEPLOY_TYPE" != "direct" ]]; then
    error "Deploy type must be 'docker' or 'direct'"
fi

log "Starting deployment to $DROPLET_IP using $DEPLOY_TYPE method..."

# Test SSH connection
log "Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 "$DROPLET_USER@$DROPLET_IP" "echo 'SSH connection successful'" >/dev/null 2>&1; then
    error "Cannot connect to droplet. Check IP address and SSH keys."
fi
success "SSH connection verified"

# Docker deployment function
deploy_docker() {
    log "Starting Docker deployment..."
    
    # Check if Docker is installed on droplet
    log "Checking Docker installation on droplet..."
    if ! ssh "$DROPLET_USER@$DROPLET_IP" "command -v docker" >/dev/null 2>&1; then
        warn "Docker not found on droplet. Installing..."
        ssh "$DROPLET_USER@$DROPLET_IP" "
            apt-get update &&
            apt-get install -y docker.io docker-compose &&
            systemctl enable docker &&
            systemctl start docker
        " || error "Docker installation failed"
        success "Docker installed successfully"
    fi
    
    # Build Docker image locally
    log "Building Docker image..."
    docker build -t "$DOCKER_IMAGE" . || error "Docker build failed"
    
    # Save and transfer image
    log "Transferring Docker image to droplet..."
    docker save "$DOCKER_IMAGE" | gzip | ssh "$DROPLET_USER@$DROPLET_IP" "
        cd /opt &&
        mkdir -p $APP_NAME &&
        cd $APP_NAME &&
        gunzip | docker load
    " || error "Image transfer failed"
    
    # Create docker-compose.yml on droplet
    log "Setting up Docker Compose configuration..."
    ssh "$DROPLET_USER@$DROPLET_IP" "cat > $REMOTE_DIR/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  clearfork-app:
    image: clearfork-insurance:latest
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env.production
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads  # For file uploads if needed

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=your_mysql_root_password
      - MYSQL_DATABASE=clearfork-insurance
      - MYSQL_USER=clearfork_user
      - MYSQL_PASSWORD=your_mysql_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
EOF
    
    # Copy environment file (only if it doesn't exist on server)
    log "Checking environment configuration..."
    if ! ssh "$DROPLET_USER@$DROPLET_IP" "test -f $REMOTE_DIR/.env.production"; then
        log "Transferring environment configuration..."
        if [[ -f ".env.production" ]]; then
            scp ".env.production" "$DROPLET_USER@$DROPLET_IP:$REMOTE_DIR/.env.production"
        else
        warn ".env.production not found. Creating template..."
        ssh "$DROPLET_USER@$DROPLET_IP" "cat > $REMOTE_DIR/.env.production" << 'EOF'
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=clearfork_user
DB_PASSWORD=your_mysql_password
DB_NAME=clearfork-insurance

# Add your other environment variables here
GEMINI_API_KEY=
JWT_SECRET=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
EOF
            warn "Please update $REMOTE_DIR/.env.production with your actual values"
        fi
    else
        log "Production environment file already exists on server - not overwriting"
    fi
    
    # Start services
    log "Starting services..."
    ssh "$DROPLET_USER@$DROPLET_IP" "
        cd $REMOTE_DIR &&
        docker-compose down --remove-orphans &&
        docker-compose up -d
    " || error "Service startup failed"
    
    success "Docker deployment completed"
}

# Direct deployment function
deploy_direct() {
    log "Starting direct deployment..."
    
    # Check Node.js installation
    log "Checking Node.js installation on droplet..."
    if ! ssh "$DROPLET_USER@$DROPLET_IP" "command -v node" >/dev/null 2>&1; then
        warn "Node.js not found on droplet. Installing..."
        ssh "$DROPLET_USER@$DROPLET_IP" "
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - &&
            apt-get install -y nodejs
        " || error "Node.js installation failed"
        success "Node.js installed successfully"
    fi
    
    # Create remote directory
    ssh "$DROPLET_USER@$DROPLET_IP" "mkdir -p $REMOTE_DIR"
    
    # Sync files (excluding node_modules and .next)
    log "Syncing application files..."
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.git' \
        --exclude '.env.local' \
        --exclude 'uploads' \
        ./ "$DROPLET_USER@$DROPLET_IP:$REMOTE_DIR/" || error "File sync failed"
    
    # Copy environment file (only if it doesn't exist on server)
    if ! ssh "$DROPLET_USER@$DROPLET_IP" "test -f $REMOTE_DIR/.env.production"; then
        if [[ -f ".env.production" ]]; then
            scp ".env.production" "$DROPLET_USER@$DROPLET_IP:$REMOTE_DIR/.env.production"
        fi
    else
        log "Production environment file already exists on server - not overwriting"
    fi
    
    # Install dependencies and build on remote
    log "Installing dependencies on droplet..."
    ssh "$DROPLET_USER@$DROPLET_IP" "
        cd $REMOTE_DIR &&
        npm ci --omit=dev &&
        npm run build
    " || error "Remote build failed"
    
    # Install PM2 for process management
    log "Setting up PM2 process manager..."
    ssh "$DROPLET_USER@$DROPLET_IP" "
        npm install -g pm2 &&
        cd $REMOTE_DIR &&
        pm2 delete $APP_NAME 2>/dev/null || true &&
        pm2 start npm --name '$APP_NAME' -- start &&
        pm2 save &&
        pm2 startup
    " || error "PM2 setup failed"
    
    success "Direct deployment completed"
}

# Main execution
main() {
    # Build application locally
    log "Building application locally..."
    npm run build || error "Local build failed"
    success "Local build completed"

    if [[ "$DEPLOY_TYPE" == "docker" ]]; then
        deploy_docker
    elif [[ "$DEPLOY_TYPE" == "direct" ]]; then
        deploy_direct
    fi

    success "Deployment completed successfully!"
    log "Your app should be available at: http://$DROPLET_IP:3000"

    # Show deployment status
    log "Checking deployment status..."
    ssh "$DROPLET_USER@$DROPLET_IP" "
        echo '=== System Status ===' &&
        if command -v docker >/dev/null 2>&1; then
            echo 'Docker containers:' &&
            docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
        fi &&
        if command -v pm2 >/dev/null 2>&1; then
            echo 'PM2 processes:' &&
            pm2 list
        fi &&
        echo 'Listening ports:' &&
        netstat -tlnp | grep ':3000\|:8080' || echo 'No services on port 3000/8080'
    "
}

# Run main function
main