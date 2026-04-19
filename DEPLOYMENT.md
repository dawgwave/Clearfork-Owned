# Deployment Guide for Clearfork Insurance

## Prerequisites

1. SSH access to your DigitalOcean droplet
2. Your droplet IP address
3. Production environment variables configured

## Quick Deployment

### Option 1: Docker Deployment (Recommended)
```bash
# Deploy with Docker (includes MySQL container)
./scripts/deploy.sh docker YOUR_DROPLET_IP
```

### Option 2: Direct Deployment
```bash
# Deploy directly to Node.js
./scripts/deploy.sh direct YOUR_DROPLET_IP
```

## Before First Deployment

### 1. Configure Production Environment
Edit `.env.production` with your actual values:
```bash
# Required values to change:
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_64_chars_long
GEMINI_API_KEY=your_google_gemini_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

### 2. Test SSH Connection
```bash
ssh root@YOUR_DROPLET_IP
```

### 3. Run Deployment
```bash
# Make sure you're in the project root
cd /home/godev/WebstormProjects/Clearfork-Insurance

# Deploy (will prompt for droplet IP if not provided)
./scripts/deploy.sh docker
```

## What the Deployment Script Does

### Docker Deployment:
1. ✅ Builds Next.js app locally
2. ✅ Installs Docker on droplet (if needed)
3. ✅ Builds Docker image
4. ✅ Transfers image to droplet
5. ✅ Creates docker-compose.yml with MySQL
6. ✅ Starts services with Docker Compose

### Direct Deployment:
1. ✅ Builds Next.js app locally  
2. ✅ Installs Node.js on droplet (if needed)
3. ✅ Syncs files via rsync
4. ✅ Installs dependencies on droplet
5. ✅ Builds app on droplet
6. ✅ Sets up PM2 process manager

## After Deployment

### Check Status
```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# For Docker deployment
cd /opt/clearfork-insurance
docker-compose ps

# For direct deployment  
pm2 status
```

### View Logs
```bash
# Docker logs
docker-compose logs -f clearfork-app

# PM2 logs
pm2 logs clearfork-insurance
```

### Access Application
- **Web App**: `http://YOUR_DROPLET_IP:3000`
- **Admin Panel**: `http://YOUR_DROPLET_IP:3000/admin`

## Database Setup

### Docker Deployment
Database runs automatically in MySQL container.

### Direct Deployment
Install MySQL manually:
```bash
ssh root@YOUR_DROPLET_IP
apt update && apt install mysql-server -y
mysql_secure_installation
```

Then create database and user:
```sql
CREATE DATABASE clearfork_insurance;
CREATE USER 'clearfork_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON clearfork_insurance.* TO 'clearfork_user'@'localhost';
FLUSH PRIVILEGES;
```

## Production Checklist

- [ ] `.env.production` configured with real values
- [ ] SSH key added to droplet
- [ ] Domain DNS pointing to droplet IP
- [ ] SSL certificate configured (Nginx/Caddy)
- [ ] Firewall configured (UFW)
- [ ] Regular backups scheduled
- [ ] Monitoring set up

## Troubleshooting

### Common Issues:

1. **SSH Connection Failed**
   ```bash
   # Add your SSH key to droplet
   ssh-copy-id root@YOUR_DROPLET_IP
   ```

2. **Port 3000 Not Accessible**
   ```bash
   # Check firewall
   ufw allow 3000
   ```

3. **Database Connection Failed**
   - Check `.env.production` database credentials
   - Ensure MySQL is running: `systemctl status mysql`

4. **Build Failed**
   - Check Node.js version: `node --version` (should be 22.x)
   - Clear cache: `rm -rf .next node_modules && npm install`

## Rollback

### Docker Deployment
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/clearfork-insurance
docker-compose down
# Deploy previous version
```

### Direct Deployment
```bash
ssh root@YOUR_DROPLET_IP
pm2 restart clearfork-insurance
```

## Updates

To deploy updates:
1. Commit your changes locally
2. Re-run the deployment script
3. The script handles stopping/starting services

```bash
./scripts/deploy.sh docker YOUR_DROPLET_IP
```