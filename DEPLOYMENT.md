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

### Single droplet: fix production first

Docker Compose lives under `/opt/clearfork-insurance`: **Caddy** on **:80 / :443** → **`clearfork-app`** (`.env.production`), plus **MySQL**.

**When the public site is down:**

```bash
ssh root@YOUR_DROPLET_IP
cd /opt/clearfork-insurance

# Core stack (prod + DB + Caddy). Use `docker compose` or `docker-compose` to match the server.
docker compose up -d mysql clearfork-app caddy

docker compose ps
docker compose logs --tail=100 clearfork-app
docker compose logs --tail=50 caddy
```

If **`clearfork-app` keeps restarting**, the entrypoint is likely stuck on **migrations**. Inspect the log tail, fix SQL/schema, redeploy a corrected image, or temporarily set **`RUN_MIGRATIONS=false`** for **`clearfork-app`** in `docker-compose.yml` on the server only as a last resort to get HTTP 200 back, then fix the DB and turn migrations on again.

**Removed colocated staging (:3001)** — if an old **`clearfork-app-staging`** container still exists after you deploy this repo version, remove it once (Compose no longer defines that service):

```bash
cd /opt/clearfork-insurance
docker ps -a --format '{{.Names}}' | grep -E 'staging|clearfork-app-staging' || true
# Replace NAME with the container name from the line above, if any:
# docker rm -f NAME
```

Optional: drop the unused MySQL database **`clearfork-insurance-staging`** if you created it for the old staging app (`mysql` shell as root).

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
docker-compose logs -f caddy

# PM2 logs
pm2 logs clearfork-insurance
```

### Access Application

Docker deploy runs **Caddy** on **80** and **443**, reverse-proxying to the Next.js container on **8080** (not exposed on the host).

- **HTTP (by IP)**: `http://YOUR_DROPLET_IP/`
- **HTTPS (after DNS points here)**: `https://clearforkinsurance.com/` and `https://www.clearforkinsurance.com/`
- **Admin**: `https://clearforkinsurance.com/admin` (or `http://YOUR_DROPLET_IP/admin` over port 80)

**Raw IP in the browser**

- Use **`http://YOUR_DROPLET_IP/`** (HTTP, port 80). **`https://` + IP** will not work with a normal certificate; use HTTP for IP, or use **`https://clearforkinsurance.com`** once DNS points here.
- **Port 3000** is no longer exposed on the host; the app is only reachable via Caddy on **80** / **443**.

**Before DNS is updated:** Let’s Encrypt can only issue certs for hostnames, not for a bare IP. The repo `Caddyfile` includes an extra **`:80`** block so **HTTP by IP** still reaches the app. If Caddy fails to start (e.g. config conflict on an old Caddy version), fall back to `cp Caddyfile.ip-only Caddyfile && docker-compose restart caddy`.

## Database Setup

### Docker Deployment
Database runs automatically in the MySQL container.

**Schema migrations:** When `RUN_MIGRATIONS=true` (default in `docker-compose.yml` for `clearfork-app`), the app container entrypoint runs `scripts/migrate.ts up` (same runner as `npm run migrate` locally) after retries until MySQL accepts connections. To skip (e.g. debugging), set `RUN_MIGRATIONS=false` for that service. For a legacy DB whose `migrations` ledger table does not match `src/lib/migrations.ts`, fix the table or apply SQL manually before relying on auto-migrate.

### Direct deployment (PM2) and ports

`direct` mode does not start Caddy. Run the app on **8080** (`PORT=8080` in `.env.production`) and either:

- Put **Caddy/nginx** on the host listening on **80/443** and `reverse_proxy` to `127.0.0.1:8080`, or  
- For local testing only: `http://YOUR_DROPLET_IP:8080` (open the port in the firewall if you use this).

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
- [ ] SSL: Caddy obtains certificates automatically when `deploy/Caddyfile` is used and DNS points to the droplet
- [ ] Firewall: `ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable`
- [ ] Regular backups scheduled
- [ ] Monitoring set up

## Troubleshooting

### Common Issues:

1. **SSH Connection Failed**
   ```bash
   # Add your SSH key to droplet
   ssh-copy-id root@YOUR_DROPLET_IP
   ```

2. **Port 80 / 443 Not Accessible**
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw status
   ```
   The app container does **not** need port 3000 on the host; Caddy listens on 80/443.

3. **Caddy / HTTPS errors**
   - Confirm DNS A records for `@` and `www` point to the droplet.
   - Check logs: `docker-compose logs caddy`
   - For IP-only testing, use `Caddyfile.ip-only` as noted above.

4. **Database Connection Failed**
   - Check `.env.production` database credentials
   - Ensure MySQL is running: `systemctl status mysql`

5. **Build Failed**
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