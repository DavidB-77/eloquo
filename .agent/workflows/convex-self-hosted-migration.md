---
description: Migration from Convex Cloud to Self-Hosted on VPS
---

# Convex Cloud to Self-Hosted Migration Workflow

This workflow guides you through migrating from Convex Cloud to a self-hosted Convex instance on your VPS.

## Prerequisites

- VPS with at least **2GB RAM** and **20GB storage**
- Docker and Docker Compose installed
- SSH access to your VPS
- Current Convex Cloud deployment: `rightful-goldfish-829`

---

## Phase 1: Prepare Your VPS

### Step 1.1: SSH into your VPS

```bash
ssh root@your-vps-ip
```

### Step 1.2: Install Docker (if not already installed)

// turbo

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
```

### Step 1.3: Create directories

// turbo

```bash
mkdir -p /root/convex-self-hosted
mkdir -p /root/convex-data
```

---

## Phase 2: Set Up Self-Hosted Convex

### Step 2.1: Create docker-compose.yml

// turbo

```bash
cat > /root/convex-self-hosted/docker-compose.yml << 'EOF'
version: "3.8"

services:
  backend:
    image: ghcr.io/get-convex/convex-backend:latest
    container_name: convex-backend
    restart: unless-stopped
    ports:
      - "3210:3210"
      - "3211:3211"
    volumes:
      - convex-data:/convex/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3210/version"]
      interval: 30s
      timeout: 10s
      retries: 3

  dashboard:
    image: ghcr.io/get-convex/convex-dashboard:latest
    container_name: convex-dashboard
    restart: unless-stopped
    ports:
      - "6791:6791"
    environment:
      - BACKEND_URL=http://backend:3210
    depends_on:
      backend:
        condition: service_healthy

volumes:
  convex-data:
    driver: local
EOF
```

### Step 2.2: Start Convex

// turbo

```bash
cd /root/convex-self-hosted && docker compose up -d
```

### Step 2.3: Wait for startup then generate admin key

```bash
sleep 20 && docker compose exec backend ./generate_admin_key.sh
```

**⚠️ SAVE THE ADMIN KEY - You'll need it!**

---

## Phase 3: Export Data from Convex Cloud

### Step 3.1: On your LOCAL machine (not VPS), export all data

```bash
cd C:\Users\David B\Desktop\prompt
npx convex export --path ./convex-cloud-export.zip
```

### Step 3.2: Upload export to VPS

```bash
scp ./convex-cloud-export.zip root@your-vps-ip:/root/eloquo/
```

---

## Phase 4: Configure App for Self-Hosted

### Step 4.1: Update .env.local on VPS

```bash
# On VPS, edit /root/eloquo/.env.local
nano /root/eloquo/.env.local
```

Add these variables (replace with your values):

```env
# Self-Hosted Convex
CONVEX_SELF_HOSTED_URL=http://localhost:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=<your-admin-key-from-step-2.3>

# Frontend URL (for the Next.js app)
NEXT_PUBLIC_CONVEX_URL=http://your-vps-ip:3210

# Site URL
NEXT_PUBLIC_SITE_URL=http://your-vps-ip:3000
```

---

## Phase 5: Deploy Functions & Import Data

### Step 5.1: Deploy Convex functions to self-hosted

```bash
cd /root/eloquo
export CONVEX_SELF_HOSTED_URL=http://localhost:3210
export CONVEX_SELF_HOSTED_ADMIN_KEY=<your-admin-key>
npx convex deploy --self-hosted --yes
```

### Step 5.2: Import data

```bash
npx convex import --self-hosted /root/eloquo/convex-cloud-export.zip --replace-all
```

---

## Phase 6: Update & Restart App

### Step 6.1: Rebuild the app

// turbo

```bash
cd /root/eloquo && npm run build
```

### Step 6.2: Restart PM2

```bash
pm2 restart all
```

---

## Phase 7: Verify Migration

### Step 7.1: Check Convex Dashboard

Open in browser: `http://your-vps-ip:6791`

### Step 7.2: Check your app

Open in browser: `http://your-vps-ip:3000`

### Step 7.3: Verify data

- Log in and check your profile shows correctly
- Check admin dashboard has all users
- Verify optimization history is present

---

## Troubleshooting

### Convex backend not starting

```bash
docker compose logs backend
```

### Auth issues

For Better Auth with self-hosted Convex, you may need to update the auth configuration.
Check `convex/auth.config.ts` for any hardcoded URLs.

### Data import fails

Try importing tables individually:

```bash
npx convex import --self-hosted --table profiles ./profiles.jsonl
```

---

## Rollback Plan

If something goes wrong, revert to Convex Cloud:

1. Restore `.env.local` to use `NEXT_PUBLIC_CONVEX_URL=https://rightful-goldfish-829.convex.cloud`
2. `npm run build && pm2 restart all`

---

## Post-Migration Cleanup

Once everything is verified working:

1. Stop using Convex Cloud (no more deployments there)
2. Configure Nginx for SSL on ports 3210, 3211, and 6791
3. Set up automatic backups:

```bash
# Add to crontab
0 3 * * * docker compose exec backend ./export.sh > /backups/convex-$(date +\%Y\%m\%d).zip
```
