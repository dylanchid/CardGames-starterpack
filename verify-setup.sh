#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Starting verification process...${NC}"

# Function to check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 is installed${NC}"
        return 0
    fi
}

# Function to check if a port is in use
check_port() {
    if lsof -i :$1 > /dev/null; then
        echo -e "${RED}❌ Port $1 is in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Check Docker
echo -e "\n${YELLOW}Checking Docker...${NC}"
if ! check_command "docker"; then
    echo -e "${RED}Please install Docker first${NC}"
    exit 1
fi

# Check Docker daemon
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Docker daemon is running${NC}"
fi

# Check Supabase CLI
echo -e "\n${YELLOW}Checking Supabase CLI...${NC}"
if ! check_command "supabase"; then
    echo -e "${RED}Please install Supabase CLI first${NC}"
    exit 1
fi

# Check required ports
echo -e "\n${YELLOW}Checking required ports...${NC}"
PORTS=(54321 54322 54323 54324 54325 54326)
for port in "${PORTS[@]}"; do
    check_port $port
done

# Check Supabase project status
echo -e "\n${YELLOW}Checking Supabase project status...${NC}"
if supabase status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Supabase project is initialized${NC}"
else
    echo -e "${YELLOW}⚠️ Supabase project is not initialized${NC}"
fi

# Check database migrations
echo -e "\n${YELLOW}Checking database migrations...${NC}"
if [ -d "supabase/migrations" ]; then
    echo -e "${GREEN}✅ Migrations directory exists${NC}"
    echo -e "Found $(ls supabase/migrations/*.sql 2>/dev/null | wc -l) migration files"
else
    echo -e "${RED}❌ Migrations directory not found${NC}"
fi

# Check seed data
echo -e "\n${YELLOW}Checking seed data...${NC}"
if [ -d "supabase/seed" ]; then
    echo -e "${GREEN}✅ Seed directory exists${NC}"
    echo -e "Found $(ls supabase/seed/*.sql 2>/dev/null | wc -l) seed files"
else
    echo -e "${RED}❌ Seed directory not found${NC}"
fi

# Check environment variables
echo -e "\n${YELLOW}Checking environment variables...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    # Check for required variables
    REQUIRED_VARS=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            echo -e "${GREEN}✅ $var is set${NC}"
        else
            echo -e "${RED}❌ $var is not set${NC}"
        fi
    done
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

echo -e "\n${YELLOW}Verification complete!${NC}"
echo -e "If you see any ${RED}❌${NC}, please address those issues before proceeding."
echo -e "If everything shows ${GREEN}✅${NC}, you're ready to start development!" 