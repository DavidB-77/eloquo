#!/bin/bash

# Deep Diagnosis Script for Eloquo Auth Stack
# This script audits Nginx, Docker, Convex, and Next.js for mismatches.

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Starting Deep Audit of Eloquo Infrastructure ===${NC}"

# 1. Check PM2 Processes
echo -e "\n${YELLOW}1. Checking PM2 Processes:${NC}"
pm2 status eloquo --no-color

# 2. Check Listening Ports
echo -e "\n${YELLOW}2. Checking Listening Ports:${NC}"
echo "Port 3000 (Next.js): $(netstat -tpln | grep :3000 || echo -e "${RED}MISSING${NC}")"
echo "Port 3210 (Convex API): $(netstat -tpln | grep :3210 || echo -e "${RED}MISSING${NC}")"
echo "Port 3211 (Convex Site): $(netstat -tpln | grep :3211 || echo -e "${RED}MISSING${NC}")"

# 3. Check Nginx Config for Mismatches
echo -e "\n${YELLOW}3. Auditing Nginx Configuration (/etc/nginx/sites-enabled/eloquo.io):${NC}"
NGINX_CONF="/etc/nginx/sites-enabled/eloquo.io"
if [ -f "$NGINX_CONF" ]; then
    echo "Front-end Location /: $(grep -A 5 "location / {" "$NGINX_CONF" | grep proxy_pass | xargs)"
    echo "Convex API /convex/: $(grep -A 5 "location /convex/ {" "$NGINX_CONF" | grep proxy_pass | xargs)"
    echo "Convex Site /convex-site/: $(grep -A 5 "location /convex-site/ {" "$NGINX_CONF" | grep proxy_pass | xargs)"
else
    echo -e "${RED}Nginx config not found at $NGINX_CONF${NC}"
fi

# 4. Check Environment Variables Consistency
echo -e "\n${YELLOW}4. Auditing .env.local Consistency:${NC}"
ENV_FILE="/var/www/eloquo/.env.local"
if [ -f "$ENV_FILE" ]; then
    NEXT_URL=$(grep NEXT_PUBLIC_CONVEX_URL "$ENV_FILE" | cut -d'=' -f2)
    SITE_URL=$(grep NEXT_PUBLIC_CONVEX_SITE_URL "$ENV_FILE" | cut -d'=' -f2)
    echo "NEXT_PUBLIC_CONVEX_URL: $NEXT_URL"
    echo "NEXT_PUBLIC_CONVEX_SITE_URL: $SITE_URL"
    
    if [[ "$SITE_URL" != *"convex-site"* ]]; then
        echo -e "${RED}WARNING: SITE_URL doesn't seem to match Nginx /convex-site/ path!${NC}"
    fi
else
    echo -e "${RED}.env.local MISSING${NC}"
fi

# 5. Check Docker Container Environment
echo -e "\n${YELLOW}5. Auditing Convex Docker Environment:${NC}"
docker inspect convex-backend --format '{{range .Config.Env}}{{println .}}{{end}}' | grep CONVEX_

# 6. Probing Authentication Endpoints (Connectivity Test)
echo -e "\n${YELLOW}6. Probing Connectivity & Discovery:${NC}"
echo -e "Testing Internal Health (/health):"
curl -s -o /dev/null -w "Code: %{http_code}\n" http://localhost:3211/health

echo -e "Testing Public Discovery URL (JWKS):"
# We'll try the common paths to see what's actually registered
curl -s "http://localhost:3211/.well-known/openid-configuration" | grep -q "issuer" && echo -e "${GREEN}FOUND at /.well-known/openid-configuration${NC}" || echo -e "${RED}NOT at /.well-known/openid-configuration${NC}"
curl -s "http://localhost:3211/api/auth/convex/.well-known/openid-configuration" | grep -q "issuer" && echo -e "${GREEN}FOUND at /api/auth/convex/.well-known/openid-configuration${NC}" || echo -e "${RED}NOT at /api/auth/convex/...${NC}"

# 7. Check for Header Issues
echo -e "\n${YELLOW}7. Testing for Next.js -> Convex Proxy Issues:${NC}"
curl -sv http://localhost:3000/api/auth/get-session 2>&1 | grep "HTTP/" | head -n 5

echo -e "\n${YELLOW}=== Audit Complete ===${NC}"
