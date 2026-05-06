#!/bin/bash
# Local Development Setup Script
# Loads environment variables and starts Jekyll

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}📝 Church Website - Local Development Setup${NC}"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local not found!${NC}"
    echo ""
    echo "Setup steps:"
    echo "1. Copy template: ${YELLOW}cp .env.local.template .env.local${NC}"
    echo "2. Edit .env.local and add your GOOGLE_API_KEY"
    echo "3. Run this script again"
    echo ""
    exit 1
fi

# Load environment variables from .env.local
echo -e "${YELLOW}📦 Loading environment variables from .env.local...${NC}"
export $(cat .env.local | grep -v '^#' | xargs)

# Verify GOOGLE_API_KEY is set
if [ -z "$GOOGLE_API_KEY" ] || [ "$GOOGLE_API_KEY" = "your_api_key_here" ]; then
    echo -e "${RED}❌ GOOGLE_API_KEY not configured!${NC}"
    echo ""
    echo "Edit .env.local and set GOOGLE_API_KEY to your actual API key"
    exit 1
fi

echo -e "${GREEN}✓ GOOGLE_API_KEY loaded${NC}"
echo ""

# Check for required files
echo -e "${YELLOW}📋 Checking dependencies...${NC}"
if ! command -v bundle &> /dev/null; then
    echo -e "${RED}❌ Bundler not found. Install Ruby dependencies first:${NC}"
    echo "  bundle install"
    exit 1
fi

if ! bundle check &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Ruby dependencies...${NC}"
    bundle install
fi

echo -e "${GREEN}✓ All dependencies ready${NC}"
echo ""

# Start Jekyll
PORT=${PORT:-4000}
echo -e "${GREEN}🚀 Starting Jekyll on http://localhost:${PORT}${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

bundle exec jekyll serve --port $PORT --livereload
