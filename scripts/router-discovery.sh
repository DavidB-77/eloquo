#!/bin/bash
# Router Discovery Script
# Probes Port 3211 for any registered auth routes using common patterns.

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

TARGET="http://localhost:3211"
PATHS=(
  "/health"
  "/.well-known/openid-configuration"
  "/api/auth/.well-known/openid-configuration"
  "/api/auth/convex/.well-known/openid-configuration"
  "/auth/.well-known/openid-configuration"
  "/api/auth/get-session"
  "/api/auth/convex/get-session"
  "/get-session"
)

echo -e "${YELLOW}=== Starting Router Discovery Scan on $TARGET ===${NC}"

for p in "${PATHS[@]}"; do
  echo -n "Probing $p... "
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET$p")
  if [ "$CODE" == "200" ]; then
    echo -e "${GREEN}200 OK${NC}"
    # If it's a 200, show the content snippet to verify it's the right resource
    curl -s "$TARGET$p" | head -c 50
    echo ""
  elif [ "$CODE" == "404" ]; then
    echo -e "${RED}404 Not Found${NC}"
  else
    echo -e "${YELLOW}$CODE${NC}"
  fi
done

echo -e "\n${YELLOW}=== Checking Convex Backend Internal Logs for Route Mismatch ===${NC}"
# We trigger a known 404 to see how Convex logs it
curl -s "$TARGET/identify-me-random-path" > /dev/null
docker logs convex-backend --tail 20

echo -e "\n${YELLOW}=== Verifying Nginx -> Convex Mapping ===${NC}"
# Probe the same paths via Nginx
PUBLIC_TARGET="https://eloquo.io/convex-site"
for p in "${PATHS[@]}"; do
  echo -n "Probing PUBLIC $PUBLIC_TARGET$p... "
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PUBLIC_TARGET$p")
  if [ "$CODE" == "200" ]; then
    echo -e "${GREEN}200 OK${NC}"
  else
    echo -e "${RED}$CODE${NC}"
  fi
done
