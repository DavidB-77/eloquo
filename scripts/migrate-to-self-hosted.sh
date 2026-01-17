#!/bin/bash

# =============================================================================
# ELOQUO: Convex Cloud to Self-Hosted Migration Script
# =============================================================================
# This script automates the migration from Convex Cloud to Self-Hosted
# Run this on your VPS
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "=============================================="
echo "   ELOQUO: Convex Self-Hosted Migration"
echo "=============================================="
echo -e "${NC}"

# Configuration - UPDATE THESE VALUES
CONVEX_CLOUD_URL="https://rightful-goldfish-829.convex.cloud"
APP_DIR="/root/eloquo"  # Your app directory on VPS
CONVEX_DATA_DIR="/root/convex-data"  # Where Convex will store data
DOCKER_COMPOSE_DIR="/root/convex-self-hosted"

# Step 1: Check prerequisites
echo -e "${YELLOW}[1/8] Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker not found. Installing...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker installed!${NC}"
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Docker Compose not found. Installing...${NC}"
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"

# Step 2: Create directories
echo -e "${YELLOW}[2/8] Creating directories...${NC}"
mkdir -p $DOCKER_COMPOSE_DIR
mkdir -p $CONVEX_DATA_DIR
mkdir -p $CONVEX_DATA_DIR/exports

echo -e "${GREEN}✓ Directories created${NC}"

# Step 3: Download docker-compose.yml
echo -e "${YELLOW}[3/8] Setting up Docker Compose for Convex...${NC}"

cat > $DOCKER_COMPOSE_DIR/docker-compose.yml << 'EOF'
version: "3.8"

services:
  backend:
    image: ghcr.io/get-convex/convex-backend:latest
    container_name: convex-backend
    restart: unless-stopped
    ports:
      - "3210:3210"  # Main API
      - "3211:3211"  # HTTP Actions
    volumes:
      - convex-data:/convex/data
      - ./exports:/exports
    environment:
      - CONVEX_SITE_URL=http://localhost:3211
      # Uncomment and set for production:
      # - CONVEX_SITE_URL=https://your-domain.com
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

echo -e "${GREEN}✓ Docker Compose configured${NC}"

# Step 4: Start Convex self-hosted
echo -e "${YELLOW}[4/8] Starting Convex self-hosted backend...${NC}"
cd $DOCKER_COMPOSE_DIR
docker compose pull
docker compose up -d

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 15

# Check if backend is running
if curl -s http://localhost:3210/version > /dev/null; then
    echo -e "${GREEN}✓ Convex backend is running!${NC}"
else
    echo -e "${RED}Backend not responding. Checking logs...${NC}"
    docker compose logs backend
    exit 1
fi

# Step 5: Generate admin key
echo -e "${YELLOW}[5/8] Generating admin key...${NC}"
ADMIN_KEY=$(docker compose exec -T backend ./generate_admin_key.sh 2>/dev/null | tail -1)
echo -e "${GREEN}✓ Admin key generated${NC}"
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}SAVE THIS ADMIN KEY (you'll need it):${NC}"
echo -e "${CYAN}========================================${NC}"
echo "$ADMIN_KEY"
echo -e "${CYAN}========================================${NC}"
echo ""

# Step 6: Export data from Convex Cloud
echo -e "${YELLOW}[6/8] Exporting data from Convex Cloud...${NC}"
echo "This requires your Convex deploy key (found in Convex Cloud dashboard)"
echo ""

cd $APP_DIR

# Create export script
cat > /tmp/export_cloud_data.sh << 'EXPORT_EOF'
#!/bin/bash
# Export all data from Convex Cloud

# Export to zip file
npx convex export --path /tmp/convex-cloud-export.zip

echo "Data exported to /tmp/convex-cloud-export.zip"
EXPORT_EOF

chmod +x /tmp/export_cloud_data.sh
echo ""
echo -e "${YELLOW}To export your cloud data, run:${NC}"
echo "  cd $APP_DIR && npx convex export --path /tmp/convex-cloud-export.zip"
echo ""
read -p "Press ENTER after you've exported the data (or type 'skip' to skip): " EXPORT_RESPONSE

# Step 7: Update app configuration
echo -e "${YELLOW}[7/8] Updating app configuration...${NC}"

# Get the VPS public IP
VPS_IP=$(curl -s ifconfig.me || echo "YOUR_VPS_IP")

# Create new .env.local for self-hosted
cat > $APP_DIR/.env.local.selfhosted << EOF
# =============================================================================
# SELF-HOSTED CONVEX CONFIGURATION
# =============================================================================

# Convex Self-Hosted
CONVEX_SELF_HOSTED_URL=http://${VPS_IP}:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=${ADMIN_KEY}

# For the frontend (Next.js)
NEXT_PUBLIC_CONVEX_URL=http://${VPS_IP}:3210

# Site URL (update with your actual domain)
NEXT_PUBLIC_SITE_URL=http://${VPS_IP}:3000

# Keep your existing API keys
# (Copy these from your current .env.local)
# OPENROUTER_API_KEY=
# DODO_PAYMENTS_API_KEY=
# etc.
EOF

echo -e "${GREEN}✓ Configuration file created: $APP_DIR/.env.local.selfhosted${NC}"

# Step 8: Import data to self-hosted
echo -e "${YELLOW}[8/8] Importing data to self-hosted Convex...${NC}"

if [ -f /tmp/convex-cloud-export.zip ]; then
    # Set environment for self-hosted
    export CONVEX_SELF_HOSTED_URL="http://localhost:3210"
    export CONVEX_SELF_HOSTED_ADMIN_KEY="$ADMIN_KEY"
    
    # Push the schema first
    cd $APP_DIR
    npx convex deploy --self-hosted --yes
    
    # Import the data
    npx convex import --self-hosted /tmp/convex-cloud-export.zip --replace-all
    
    echo -e "${GREEN}✓ Data imported successfully!${NC}"
else
    echo -e "${YELLOW}No export file found. You'll need to import data manually:${NC}"
    echo "  1. Export from cloud: npx convex export --path /tmp/convex-cloud-export.zip"
    echo "  2. Import to self-hosted: npx convex import --self-hosted /tmp/convex-cloud-export.zip --replace-all"
fi

# Final summary
echo ""
echo -e "${GREEN}=============================================="
echo "   MIGRATION COMPLETE!"
echo "=============================================="
echo -e "${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Copy your API keys from current .env.local to .env.local.selfhosted"
echo "   Then: mv .env.local.selfhosted .env.local"
echo ""
echo "2. Rebuild your app:"
echo "   npm run build"
echo "   pm2 restart all"
echo ""
echo "3. Access your services:"
echo "   - App:       http://${VPS_IP}:3000"
echo "   - Convex API: http://${VPS_IP}:3210"
echo "   - Dashboard:  http://${VPS_IP}:6791"
echo ""
echo "4. For production with SSL, use Nginx to reverse proxy all services"
echo ""
echo -e "${CYAN}Admin Key (save this!):${NC}"
echo "$ADMIN_KEY"
echo ""
