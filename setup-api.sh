#!/bin/bash

# API Integration Setup Script
# This script helps set up and test the API endpoints

set -e

echo "🚀 API Integration Setup"
echo "========================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check environment variables
echo -e "\n${BLUE}1. Checking environment variables...${NC}"
if [ -z "$NEXTAUTH_SECRET" ]; then
  echo -e "${YELLOW}⚠️  NEXTAUTH_SECRET not set. Generating random secret...${NC}"
  SECRET=$(openssl rand -base64 32)
  echo "NEXTAUTH_SECRET=$SECRET" >> .env
  echo -e "${GREEN}✓ Added NEXTAUTH_SECRET to .env${NC}"
fi

if [ -z "$NEXTAUTH_URL" ]; then
  echo "NEXTAUTH_URL=http://localhost:3000" >> .env
  echo -e "${GREEN}✓ Added NEXTAUTH_URL to .env${NC}"
fi

if [ -z "$ENCRYPTION_KEY" ]; then
  KEY=$(openssl rand -base64 32)
  echo "ENCRYPTION_KEY=$KEY" >> .env
  echo -e "${GREEN}✓ Added ENCRYPTION_KEY to .env${NC}"
fi

# 2. Install dependencies
echo -e "\n${BLUE}2. Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
  bun install
  echo -e "${GREEN}✓ Dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# 3. Setup Prisma
echo -e "\n${BLUE}3. Setting up Prisma...${NC}"
bun run db:generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

# 4. Run migrations
echo -e "\n${BLUE}4. Running database migrations...${NC}"
bun run db:push
echo -e "${GREEN}✓ Database migrations applied${NC}"

# 5. Create test user (optional)
echo -e "\n${BLUE}5. Ready to test!${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Start dev server: bun run dev"
echo "2. API will be available at: http://localhost:3000/api"
echo "3. See API_DOCUMENTATION.md for endpoint details"
echo ""
